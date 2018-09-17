function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
  .getContent();
}

function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  
  ui.createMenu('Custom Actions')
  .addSubMenu(ui.createMenu('Send Email')
              .addItem('Mass Mail', 'openMassMailDialog')
              .addItem('Confrimation Mail', 'openConfrimationMailDialog'))
  .addToUi();
}

function openMassMailDialog() {
  var html = HtmlService.createTemplateFromFile('mail').evaluate();
  SpreadsheetApp.getUi()
  .showModalDialog(html, 'Nytt Massutskick'); 
}

function openConfrimationMailDialog() {
  var html = HtmlService.createTemplateFromFile('confirmation_mail_dialog').evaluate();
  SpreadsheetApp.getUi()
  .showModalDialog(html, 'Nytt mailutskick'); 
}

function onMemberFormSubmit() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheets()[0];
  var lastRow = s.getLastRow();
  var range = s.getRange('B' + lastRow + ':E' + lastRow);
  var values = range.getValues()[0];
  
  MailApp.sendEmail(
    "helloliugamers@gmail.com",
    "Ny Medlem!",
    values[0] + " " + values[1] + " " + "Har har blivit medlem, vänligen bekräfta dennes betalning!");
  
  var memberSheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[1];
  var memberSheetLastRow = memberSheet.getLastRow();
  var insertRow = memberSheetLastRow + 1;
  
  memberSheet.getRange(insertRow, getColNumByName("Förnamn")).setValue(values[0]);
  memberSheet.getRange(insertRow, getColNumByName("Efternamn")).setValue(values[1]);
  memberSheet.getRange(insertRow, getColNumByName("Epost")).setValue(values[2]);
  memberSheet.getRange(insertRow, getColNumByName("Discordnamn")).setValue(values[3]);
}

function sendEmails(subject, body, startRow, emailColumn, members) { 
  if (prompt("Är du säker på att du vill skicka ett email till samtliga medlemmar?")) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[1];
    Logger.log(getColNumByName("Epost"))
    if (startRow == "") {
      startRow = 2;
    }
    if (emailColumn == "") {
      emailColumn = getColNumByName("Epost");
    }
    if (members == "") {
      members = sheet.getRange(2,getColNumByName("Antal medlemmar")).getValue();
    }
    
    var range = sheet.getRange(startRow, emailColumn, members);
    var recipients = range.getValues();
    var logoUrl = "https://i.imgur.com/MUELvFw.png";
    
    try {
      var logoBlob = getLiuGamerLogo (logoUrl);
    }catch(e){
      Logger.log(e);
    }
    
    for each (var recipient in recipients) {
      try {
        if (logoBlob != null) {
          sendSignedEmail(recipient, subject, body, logoBlob);
        } else {
          sendSignedEmail(recipient, subject, body);
        }
      } catch(e) {
        Logger.log(e);
      }
    }
  }
}

function sendRegistrationConfirmationMail(recipient, subject, message){
  if (prompt("Är du säker på att betalningen har kommit in?")) {
    var logoUrl = "https://i.imgur.com/MUELvFw.png"
    try {
      sendSignedEmail(recipient, subject, message, getLiuGamerLogo(logoUrl));
    } catch(e) {
      Logger.log(e);
    }
  }
}

function prompt(message){
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(message,ui.ButtonSet.YES_NO);
  return response == ui.Button.YES
}

function getColNumByName (colName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[1];
  var data = sheet.getDataRange().getValues();
  return data[0].indexOf(colName) + 1;
}

function sendSignedEmail(recipient, subject, body, logoBlob) {
  MailApp.sendEmail(
    recipient,
    subject,
    body,
    {
      htmlBody: body + "<br>" + "<img src='cid:logo'>",
      inlineImages:{
      logo: logoBlob
    }});
}

function sendUnsignedEmail(recipient, subject, body) {
  MailApp.sendEmail(
    recipient,
    subject,
    body);
}

function getLiuGamerLogo(logoUrl){
  try {
    var logoBlob = UrlFetchApp
    .fetch(logoUrl)
    .getBlob()
    .setName("logoBlob");
    return logoBlob;
  }catch(e){
    Logger.log(e);
  }
}

function getBottomMemberEmail() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[1];
  var range = sheet.getRange(sheet.getLastRow(),getColNumByName("Epost"));
  return range.getValue();
}

function getWelcomeMessageSubject() {
  return "Welcome Gamer!";
}

function getWelcomeMessage() {
  return "Welcome Gamer!", "Your membership has been confirmed! You are now an official member of LiU Gamers! :)"
}