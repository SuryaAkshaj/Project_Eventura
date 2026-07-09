# QR Check-in Flow

Eventura implements a "Rotating Nonce" architecture to prevent ticket fraud. Static QR codes can be easily screenshotted and shared among friends. To combat this, the QR code on the student's phone must refresh continuously.

## The Mechanism

The architecture relies on a combination of PostgreSQL (for the static token) and Redis (for the fast, rotating nonces and idempotency locks).

```mermaid
sequenceDiagram
    participant Attendee as Attendee Phone
    participant Scanner as Organizer Scanner
    participant API as Eventura API
    participant Redis as Redis Store
    participant DB as PostgreSQL

    %% 1. Token Initialization
    Attendee->>API: GET /api/v1/registrations/my-ticket
    API->>DB: Fetch Registration + User
    API-->>Attendee: Return signed qrToken
    
    %% 2. Rotating Nonce Loop (Every 60s)
    loop Every 60 Seconds
        Attendee->>API: POST /api/v1/qr/refresh-nonce (qrToken)
        API->>Redis: SETEX nonce:{registrationId} 60s random_string
        API-->>Attendee: Return random_string
        Attendee->>Attendee: Render QR containing {qrToken}:{random_string}
    end

    %% 3. Scanning Flow
    Scanner->>API: POST /api/v1/qr/scan (qrPayload)
    API->>API: Split payload into qrToken and nonce
    
    %% 4. Validation
    API->>Redis: GET nonce:{registrationId}
    alt Nonce Missing or Mismatched
        API-->>Scanner: 400 Invalid or Expired QR
    else Nonce Valid
        %% 5. Idempotency Lock
        API->>Redis: SETNX checkin-lock:{registrationId} 30s
        alt Lock Acquired (First Scan)
            API->>DB: BEGIN Transaction
            API->>DB: UPDATE Registration SET status = 'CHECKED_IN'
            API->>DB: INSERT INTO ScanLog (SUCCESS)
            API->>DB: COMMIT Transaction
            API->>Redis: DEL nonce:{registrationId}
            API-->>Scanner: 200 Success (Double Chime)
        else Lock Failed (Simultaneous Scan)
            API->>DB: INSERT INTO ScanLog (DUPLICATE)
            API-->>Scanner: 409 Duplicate Scan (Buzzer)
        end
    end
```

## Security Guarantees
1. **Screenshot Protection**: Because the nonce expires every 60 seconds, a screenshot sent via WhatsApp will likely expire before the friend reaches the front of the line.
2. **Replay Protection**: The `SETNX` lock prevents race conditions if an organizer accidentally double-taps the scan button, or if two organizers scan the same phone simultaneously.
3. **Offline Fast-Fail**: If the token signature is completely invalid, the API rejects it before even hitting Redis or PostgreSQL.
