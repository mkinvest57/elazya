---
name: himalaya
description: "CLI to manage emails via IMAP/SMTP. Use `himalaya` to list, read, write, reply, forward, search, and organize emails from the terminal. Supports multiple accounts and message composition with MML (MIME Meta Language)."
homepage: https://github.com/pimalaya/himalaya
metadata: {"alize":{"emoji":"📧","requires":{"bins":["himalaya"]},"install":[{"id":"brew","kind":"brew","formula":"himalaya","bins":["himalaya"],"label":"Install Himalaya (brew)"}]}}
---

# Himalaya Email CLI

Himalaya is a CLI email client that lets you manage emails from the terminal using IMAP, SMTP, Notmuch, or Sendmail backends.

> [!IMPORTANT]
> ## 🛡️ SAFEST WAY TO SEND EMAILS (Avoids "Unmatched Quote" Errors)
>
> **Do NOT use `printf` for complex bodies!** It fails with quotes (`'`).
>
> **✅ ALWAYS USE THIS method:**
> 1. **Create a temporary file** (e.g., `email_draft.txt`) containing the full email.
> 2. **Pipe the file** to Himalaya.
>
> **Steps for Alizé:**
> 1. Use `write_to_file` (or `exec` with `cat <<'EOF'`) to create `email_draft.txt`:
>    ```
>    From: nanashinfinite@gmail.com
>    To: RECIPIENT@example.com
>    Subject: My Subject
>
>    Hello,
>    Here is the body with symbols like ' and " !
>    ```
> 2. Run the command:
>    ```bash
>    cat email_draft.txt | himalaya template send -a default
>    ```
> 3. Delete the file: `rm email_draft.txt`

## References

- `references/configuration.md` (config file setup + IMAP/SMTP authentication)
- `references/message-composition.md` (MML syntax for composing emails)

## Prerequisites

1. Himalaya CLI installed (`himalaya --version` to verify)
2. A configuration file at `~/.config/himalaya/config.toml`
3. IMAP/SMTP credentials configured (password stored securely)

## Configuration Setup

Run the interactive wizard to set up an account:
```bash
himalaya account configure
```

Or create `~/.config/himalaya/config.toml` manually:
```toml
[accounts.personal]
email = "you@example.com"
display-name = "Your Name"
default = true

backend.type = "imap"
backend.host = "imap.example.com"
backend.port = 993
backend.encryption.type = "tls"
backend.login = "you@example.com"
backend.auth.type = "password"
backend.auth.cmd = "pass show email/imap"  # or use keyring

message.send.backend.type = "smtp"
message.send.backend.host = "smtp.example.com"
message.send.backend.port = 587
message.send.backend.encryption.type = "start-tls"
message.send.backend.login = "you@example.com"
message.send.backend.auth.type = "password"
message.send.backend.auth.cmd = "pass show email/smtp"
```

## Common Operations

### List Folders

```bash
himalaya folder list
```

### List Emails

List emails in INBOX (default):
```bash
himalaya envelope list
```

List emails in a specific folder:
```bash
himalaya envelope list --folder "Sent"
```

List with pagination:
```bash
himalaya envelope list --page 1 --page-size 20
```

### Search Emails

```bash
himalaya envelope list from john@example.com subject meeting
```

### Read an Email

Read email by ID (shows plain text):
```bash
himalaya message read 42
```

Export raw MIME:
```bash
himalaya message export 42 --full
```

### Reply to an Email

Interactive reply (opens $EDITOR):
```bash
himalaya message reply 42
```

Reply-all:
```bash
himalaya message reply 42 --all
```

### Forward an Email

```bash
himalaya message forward 42
```

### Write a New Email

**IMPORTANT FOR AUTOMATION (non-interactive usage):**

Do NOT use `himalaya message write` - it opens $EDITOR interactively!

**Use `template send` with the template as ARGUMENT (most reliable):**

```bash
# Template as argument (preferred for automation - avoids stdin issues)
himalaya template send "From: you@example.com
To: recipient@example.com
Subject: Test Message

Hello from Himalaya!"

# With a specific account (use -a flag with template send)
himalaya template send -a work "From: you@example.com
To: recipient@example.com
Subject: Test

Body here"
```

**Using heredoc (alternative):**

```bash
himalaya template send << 'TEMPLATE'
From: you@example.com
To: recipient@example.com
Subject: Test Message

Hello from Himalaya!
TEMPLATE
```

**With attachments (MML format):**

```bash
himalaya template send "From: you@example.com
To: recipient@example.com
Subject: Document attached

Please find the attachment.

<#part filename=\"/path/to/file.pdf\">"
```

**TROUBLESHOOTING:**

**"cannot prompt item from list":**
1. You have a default account: `himalaya account list` (should show one with `yes` in DEFAULT column)
2. Use `-a <account_name>` to specify account explicitly
3. Pass template as argument, not via stdin pipe

**"Folder doesn't exist" (but email was sent!):**

This is a FALSE NEGATIVE! The email IS sent successfully via SMTP, but Himalaya fails to save a copy to the "Sent" folder. This happens when:
- The Sent folder doesn't exist or has a different name on your IMAP server
- Common folder names: "Sent", "Sent Items", "Envoyés", "[Gmail]/Sent Mail"

**Fix:** Configure the correct folder in `~/.config/himalaya/config.toml`:

```toml
[accounts.default]
# ... other settings ...

# Specify the correct Sent folder name for your email provider
folder.alias.sent = "Sent"  # or "Sent Items", "[Gmail]/Sent Mail", etc.

# OR disable saving to Sent folder entirely:
message.send.save-copy = false
```

**To find the correct folder name:**
```bash
himalaya folder list
```

**IMPORTANT FOR AGENTS:** If you see "Folder doesn't exist" error, tell the user the email was likely sent successfully - only the copy to Sent folder failed.

### Move/Copy Emails

Move to folder:
```bash
himalaya message move 42 "Archive"
```

Copy to folder:
```bash
himalaya message copy 42 "Important"
```

### Delete an Email

```bash
himalaya message delete 42
```

### Manage Flags

Add flag:
```bash
himalaya flag add 42 --flag seen
```

Remove flag:
```bash
himalaya flag remove 42 --flag seen
```

## Multiple Accounts

List accounts:
```bash
himalaya account list
```

**IMPORTANT:** The `--account` flag must come BEFORE the command, not after!

```bash
# ✅ CORRECT: --account before the command
himalaya --account work envelope list
himalaya --account personal template send

# ❌ WRONG: --account after the command (will error!)
himalaya envelope list --account work
himalaya template send --account personal
```

## Attachments

Save attachments from a message:
```bash
himalaya attachment download 42
```

Save to specific directory:
```bash
himalaya attachment download 42 --dir ~/Downloads
```

## Output Formats

Most commands support `--output` for structured output:
```bash
himalaya envelope list --output json
himalaya envelope list --output plain
```

## Debugging

Enable debug logging:
```bash
RUST_LOG=debug himalaya envelope list
```

Full trace with backtrace:
```bash
RUST_LOG=trace RUST_BACKTRACE=1 himalaya envelope list
```

## Tips

- Use `himalaya --help` or `himalaya <command> --help` for detailed usage.
- Message IDs are relative to the current folder; re-list after folder changes.
- For composing rich emails with attachments, use MML syntax (see `references/message-composition.md`).
- Store passwords securely using `pass`, system keyring, or a command that outputs the password.
