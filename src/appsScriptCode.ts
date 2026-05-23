export const APPS_SCRIPT_CODE = `/**
 * ====================================================================
 * FMS FIELD VISIT PLANNER - BACKEND GOOGLE APPS SCRIPT
 * ====================================================================
 *
 * This Apps Script turns your Google Spreadsheet into a persistent CRUD API
 * for your Field Management System (FMS).
 *
 * HOW TO INSTALL:
 * 1. Open your Google Sheet.
 * 2. Create three sheets with these exact names and column headers (Row 1):
 *    
 *    Sheet name: "Fms"
 *    Column headers in Row 5 (or Row 1. Note: Row 6 should be the first data row):
 *    - Row 5 headers: 
 *      Timestamp | Visit No. | Sales Person Name | Party Name | Location | Date Of Visit | Planned | Actual | Delay | Head Of Visit | Concern Person | What Did The Customer Say | Next Visit Date
 *
 *    Sheet name: "Master"
 *    Column headers in Row 1:
 *      Party Name | Location
 *
 *    Sheet name: "Users"
 *    Column headers in Row 1:
 *      Username | Password | Name | Role
 *
 * 3. In Google Sheets, click "Extensions" > "Apps Script".
 * 4. Clear any existing code and paste this script.
 * 5. Click "Deploy" (top right) > "New deployment".
 * 6. Select "Web app" as the type.
 * 7. Set configuration:
 *    - Description: "FMS Backend Applet"
 *    - Execute as: "Me (your-email@gmail.com)"
 *    - Who has access: "Anyone" (crucial for React app to connect)
 * 8. Click "Deploy", authorize the permissions, and COPY the Web App URL.
 * 9. Paste the copied URL into your FMS React App Settings!
 */

// Configure CORS and JSON response helper
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------
// GET REQUESTS
// -------------------------------------------------------------
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = e.parameter.action;
    
    if (!action) {
      return jsonResponse({ success: false, error: "Missing 'action' parameter" });
    }
    
    if (action === "getVisits") {
      var sheet = ss.getSheetByName("Fms");
      if (!sheet) return jsonResponse({ success: false, error: "Fms sheet not found" });
      
      // Starting from Row 6 (Headers typically at Row 5)
      var startRow = 6;
      var lastRow = sheet.getLastRow();
      if (lastRow < startRow) {
        return jsonResponse({ success: true, count: 0, data: [] });
      }
      
      var range = sheet.getRange(startRow, 1, lastRow - startRow + 1, 13);
      var values = range.getValues();
      var visits = [];
      
      for (var i = 0; i < values.length; i++) {
        var row = values[i];
        if (!row[1]) continue; // Skip if Visit No is empty
        
        visits.push({
          id: (startRow + i).toString(), // row index as unique identifier
          timestamp: row[0] ? String(row[0]) : "",
          visitNo: String(row[1]),
          salesPersonName: String(row[2]),
          partyName: String(row[3]),
          location: String(row[4]),
          dateOfVisit: row[5] instanceof Date ? Utilities.formatDate(row[5], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(row[5]),
          planned: String(row[6]),
          actual: String(row[7]),
          delay: String(row[8]),
          headOfVisit: String(row[9]),
          concernPerson: String(row[10]),
          whatCustomerSaid: String(row[11]),
          nextVisitDate: row[12] instanceof Date ? Utilities.formatDate(row[12], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(row[12])
        });
      }
      return jsonResponse({ success: true, count: visits.length, data: visits });
    }
    
    if (action === "getMasters") {
      var sheet = ss.getSheetByName("Master");
      if (!sheet) return jsonResponse({ success: false, error: "Master sheet not found" });
      
      var lastRow = sheet.getLastRow();
      if (lastRow < 2) return jsonResponse({ success: true, count: 0, data: [] });
      
      var range = sheet.getRange(2, 1, lastRow - 1, 2);
      var values = range.getValues();
      var parties = [];
      
      for (var i = 0; i < values.length; i++) {
        var row = values[i];
        if (!row[0]) continue;
        parties.push({
          id: (2 + i).toString(), // row index
          partyName: String(row[0]),
          location: String(row[1])
        });
      }
      return jsonResponse({ success: true, count: parties.length, data: parties });
    }
    
    if (action === "getUsers") {
      var sheet = ss.getSheetByName("Users");
      if (!sheet) return jsonResponse({ success: false, error: "Users sheet not found" });
      
      var lastRow = sheet.getLastRow();
      if (lastRow < 2) return jsonResponse({ success: true, count: 0, data: [] });
      
      var range = sheet.getRange(2, 1, lastRow - 1, 4);
      var values = range.getValues();
      var users = [];
      
      for (var i = 0; i < values.length; i++) {
        var row = values[i];
        if (!row[0]) continue;
        users.push({
          username: String(row[0]),
          password: String(row[1]),
          name: String(row[2]),
          role: String(row[3])
        });
      }
      return jsonResponse({ success: true, count: users.length, data: users });
    }
    
    return jsonResponse({ success: false, error: "Unknown action: " + action });
    
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// -------------------------------------------------------------
// POST REQUESTS
// -------------------------------------------------------------
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var postData;
    
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      return jsonResponse({ success: false, error: "No payload received" });
    }
    
    var action = postData.action;
    if (!action) {
      return jsonResponse({ success: false, error: "Missing 'action' parameter in POST request" });
    }
    
    // ACTION: ADD VISIT
    if (action === "addVisit") {
      var sheet = ss.getSheetByName("Fms");
      if (!sheet) return jsonResponse({ success: false, error: "Fms sheet not found" });
      
      var data = postData.data;
      var timestamp = new Date();
      
      // Calculate row location
      var startRow = 6;
      var lastRow = sheet.getLastRow();
      var insertRow = lastRow < 5 ? 6 : lastRow + 1;
      
      var rowValues = [
        timestamp,
        data.visitNo || ("VIS-" + Math.floor(1000 + Math.random() * 9000)),
        data.salesPersonName,
        data.partyName,
        data.location,
        data.dateOfVisit,
        data.planned,
        data.actual,
        data.delay,
        data.headOfVisit,
        data.concernPerson,
        data.whatCustomerSaid,
        data.nextVisitDate
      ];
      
      sheet.getRange(insertRow, 1, 1, rowValues.length).setValues([rowValues]);
      return jsonResponse({ success: true, message: "Visit summary saved to Google Sheet!", id: insertRow.toString() });
    }
    
    // ACTION: UPDATE VISIT
    if (action === "updateVisit") {
      var sheet = ss.getSheetByName("Fms");
      if (!sheet) return jsonResponse({ success: false, error: "Fms sheet not found" });
      
      var data = postData.data;
      var rowIndex = parseInt(data.id);
      
      if (isNaN(rowIndex) || rowIndex < 6) {
        return jsonResponse({ success: false, error: "Invalid row ID: " + data.id });
      }
      
      // Set values specifically
      sheet.getRange(rowIndex, 4).setValue(data.partyName);
      sheet.getRange(rowIndex, 5).setValue(data.location);
      sheet.getRange(rowIndex, 6).setValue(data.dateOfVisit);
      sheet.getRange(rowIndex, 7).setValue(data.planned);
      sheet.getRange(rowIndex, 8).setValue(data.actual);
      sheet.getRange(rowIndex, 9).setValue(data.delay);
      sheet.getRange(rowIndex, 10).setValue(data.headOfVisit);
      sheet.getRange(rowIndex, 11).setValue(data.concernPerson);
      sheet.getRange(rowIndex, 12).setValue(data.whatCustomerSaid);
      sheet.getRange(rowIndex, 13).setValue(data.nextVisitDate);
      
      return jsonResponse({ success: true, message: "Field record successfully updated!" });
    }
    
    // ACTION: DELETE VISIT
    if (action === "deleteVisit") {
      var sheet = ss.getSheetByName("Fms");
      if (!sheet) return jsonResponse({ success: false, error: "Fms sheet not found" });
      
      var rowIndex = parseInt(postData.id);
      if (isNaN(rowIndex) || rowIndex < 6) {
        return jsonResponse({ success: false, error: "Invalid row index: " + postData.id });
      }
      
      sheet.deleteRow(rowIndex);
      return jsonResponse({ success: true, message: "Visit entry removed!" });
    }
    
    // ACTION: ADD PARTY TO MASTER
    if (action === "addMaster") {
      var sheet = ss.getSheetByName("Master");
      if (!sheet) return jsonResponse({ success: false, error: "Master sheet not found" });
      
      var data = postData.data;
      var lastRow = sheet.getLastRow();
      var insertRow = lastRow < 1 ? 2 : lastRow + 1;
      
      sheet.getRange(insertRow, 1, 1, 2).setValues([[data.partyName, data.location]]);
      return jsonResponse({ success: true, id: insertRow.toString() });
    }
    
    // ACTION: UPDATE MASTER PARTY
    if (action === "updateMaster") {
      var sheet = ss.getSheetByName("Master");
      if (!sheet) return jsonResponse({ success: false, error: "Master sheet not found" });
      
      var data = postData.data;
      var rowIndex = parseInt(data.id);
      if (isNaN(rowIndex) || rowIndex < 2) {
        return jsonResponse({ success: false, error: "Invalid master index" });
      }
      
      sheet.getRange(rowIndex, 1).setValue(data.partyName);
      sheet.getRange(rowIndex, 2).setValue(data.location);
      return jsonResponse({ success: true });
    }
    
    // ACTION: DELETE MASTER PARTY
    if (action === "deleteMaster") {
      var sheet = ss.getSheetByName("Master");
      if (!sheet) return jsonResponse({ success: false, error: "Master sheet not found" });
      
      var rowIndex = parseInt(postData.id);
      if (isNaN(rowIndex) || rowIndex < 2) {
        return jsonResponse({ success: false, error: "Invalid master index" });
      }
      
      sheet.deleteRow(rowIndex);
      return jsonResponse({ success: true });
    }
    
    // ACTION: ADD USER
    if (action === "addUser") {
      var sheet = ss.getSheetByName("Users");
      if (!sheet) return jsonResponse({ success: false, error: "Users sheet not found" });
      
      var data = postData.data;
      var lastRow = sheet.getLastRow();
      var insertRow = lastRow < 1 ? 2 : lastRow + 1;
      
      sheet.getRange(insertRow, 1, 1, 4).setValues([[
        data.username,
        data.password || "123456",
        data.name,
        data.role
      ]]);
      return jsonResponse({ success: true });
    }
    
    return jsonResponse({ success: false, error: "Unknown action" });
    
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}
`;
