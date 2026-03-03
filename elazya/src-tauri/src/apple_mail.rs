use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MailMessage {
    pub id: String,
    pub sender: String,
    pub subject: String,
    pub content: String,
    pub date: String,
}

/// Fetches unread recent emails from Apple Mail
pub fn get_recent_unread_emails(limit: usize) -> Result<Vec<MailMessage>, String> {
    let script = format!(
        r#"
        tell application "Mail"
            set totalMsgs to count of messages of inbox
            set searchLimit to {}
            if totalMsgs < searchLimit then set searchLimit to totalMsgs
            
            if searchLimit > 0 then
                set allMsgs to messages 1 thru searchLimit of inbox
            else
                set allMsgs to {{}}
            end if
            
            set unreadMessages to {{}}
            repeat with msg in allMsgs
                if (read status of msg is false) then
                    set end of unreadMessages to msg
                end if
            end repeat
            
            set output to "["
            set countMsgs to count of unreadMessages
            set msgLimit to {}
            if countMsgs < msgLimit then set msgLimit to countMsgs
            
            repeat with i from 1 to msgLimit
                set msg to item i of unreadMessages
                set msgId to message id of msg
                set msgSender to sender of msg
                set msgSubject to subject of msg
                set msgContent to (get text content of msg)
                set msgDate to date sent of msg
                
                -- Escape quotes and backslashes for JSON
                set msgSender to my escape_json(msgSender)
                set msgSubject to my escape_json(msgSubject)
                set msgContent to my escape_json(msgContent)
                
                set output to output & "{{\"id\":\"" & msgId & "\",\"sender\":\"" & msgSender & "\",\"subject\":\"" & msgSubject & "\",\"content\":\"" & msgContent & "\",\"date\":\"" & (msgDate as string) & "\"}}"
                if i < msgLimit then set output to output & ","
            end repeat
            set output to output & "]"
            return output
        end tell
        
        on escape_json(theText)
            set AppleScript's text item delimiters to "\\"
            set theTextItems to text items of theText
            set AppleScript's text item delimiters to "\\\\"
            set theText to theTextItems as text
            
            set AppleScript's text item delimiters to "\""
            set theTextItems to text items of theText
            set AppleScript's text item delimiters to "\\\""
            set theText to theTextItems as text
            
            set AppleScript's text item delimiters to return
            set theTextItems to text items of theText
            set AppleScript's text item delimiters to "\\n"
            set theText to theTextItems as text
            
            set AppleScript's text item delimiters to linefeed
            set theTextItems to text items of theText
            set AppleScript's text item delimiters to "\\n"
            set theText to theTextItems as text
            
            return theText
        end escape_json
        "#,
        limit, limit
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to execute osascript: {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("AppleScript error: {}", err));
    }

    let json_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if json_str.is_empty() || json_str == "[]" {
        return Ok(Vec::new());
    }

    serde_json::from_str(&json_str).map_err(|e| format!("Failed to parse JSON: {} (Raw: {})", e, json_str))
}

/// Marks an email as read in Apple Mail.
pub fn mark_email_as_read(msg_id: &str) -> Result<(), String> {
    let script = format!(
        r#"
        tell application "Mail"
            set targetMsg to first message of inbox whose message id is "{}"
            set read status of targetMsg to true
        end tell
        "#,
        msg_id
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to execute osascript: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).into_owned());
    }
    Ok(())
}

/// Drafts a new email reply and opens it in Mail.app for review.
pub fn draft_email(to: &str, subject: &str, content: &str) -> Result<(), String> {
    let script = format!(
        r#"
        tell application "Mail"
            set theMessage to make new outgoing message with properties {{subject:"{}", content:"{}" & return & return, visible:true}}
            tell theMessage
                make new to recipient at end of to recipients with properties {{address:"{}"}}
            end tell
            activate
        end tell
        "#,
        subject.replace("\"", "\\\""), content.replace("\"", "\\\"").replace("\n", "\" & return & \""), to.replace("\"", "\\\"")
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to execute osascript: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).into_owned());
    }
    Ok(())
}
