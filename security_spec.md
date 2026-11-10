# Security Specification for GameZone Store

## 1. Data Invariants
1. **User Identity & Roles**: A user cannot modify another user's profile. A non-admin user cannot grant themselves the 'admin' role. The admin email `raniamahmd25@gmail.com` is granted administrative access.
2. **Item Ownership & Mutations**: Only the publisher or an administrator can edit or delete an item (game or application).
3. **Rating Uniqueness & Boundaries**: Each user can submit exactly one rating (1 to 5 stars) per item at document ID `{itemId}_{userId}`.
4. **Comment Ownership**: Only the author or an administrator can delete/edit their own comment.
5. **Download Counting**: Download events must be recorded to prevent duplicate consecutive count increments by the same user/session.
6. **Input Sanitization**: Titles, descriptions, versions, URLs, and image payloads must adhere to string length constraints to avoid wallet denial/resource exhaustion.

## 2. The "Dirty Dozen" Payloads (Must be rejected)
1. **Ghost Field Injection in User**: User attempt to send `isSuperAdmin: true` or `role: 'admin'`.
2. **Impersonated Publisher Create**: User A attempts to create an item with `publisherId: "userB"`.
3. **Unauthorized Item Deletion**: User A attempts to delete an item belonging to User B.
4. **Unauthorized Item Update**: User A attempts to edit title, description, or downloadUrl of User B's item.
5. **Star Rating Overflow**: Submitting `stars: 6` or `stars: -1` or `stars: "five"`.
6. **Rating Impersonation**: User A writes a rating document with `userId: "userB"`.
7. **Comment Impersonation**: User A writes a comment with `userId: "userB"`.
8. **Comment Unauthorized Deletion**: User A attempts to delete User B's comment.
9. **Abuse Report Tampering**: Non-admin user tries to change report status to 'dismissed'.
10. **Giant String / Wallet Exhaustion**: Submitting an item with a 10MB description or 100KB title.
11. **Malicious Path Variable ID**: Attempting path traversal or non-alphanumeric document IDs longer than 128 chars.
12. **Anonymous Arbitrary Database List**: Unauthenticated user trying to read internal reports collection.
