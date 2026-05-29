UPDATE "Registration" SET status = 'CHECKED_IN', "checkedInAt" = NOW() WHERE "userId" = 'f9e27a18-b5c3-41ba-9897-35dd03a35e4a' RETURNING id, status;
