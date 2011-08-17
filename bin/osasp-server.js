//
// $Id: osasp-server.js 14 2011-08-12 18:46:36Z emmanuel $
//

var url = require('url');
var fs = require('fs');
var path = require('path');

var express = require('express');
var ejs = require('ejs');
var osASP = require('./../lib/osasp.js');

var app = express.createServer(
  express.logger(),
  express.bodyParser()
);

// TODO Use configuration file to get listening port
var intPort = 80;

// TODO Use configuration file to define mappings
app.all('/*', function(req,res) {
  return(HttpRequestProcess(req,res));
});


app.listen(intPort);
console.log('osASP Server running at http://127.0.0.1:'+intPort.toString(10)+'/');
console.log('Application.Contents("LIB_FORM_RPC_FORMAT") = '+Application.Contents("LIB_FORM_RPC_FORMAT"));

function HttpRequestMimeTypeIsASP(strRequestedPath)
{
  var blnIsASP = false;
  var strContentType = HttpRequestGetContentType(strRequestedPath);
  if (strContentType == "application/asp")
  {
    blnIsASP = true;
  }

  return(blnIsASP);
}

function HttpRequestGetContentType(strRequestedPath)
{
  var strContentType = "text/html";
  if (strRequestedPath)
  {
    var strFileExt = path.extname(strRequestedPath);
    // DEBUG console.log("strFileExt = " + strFileExt);
    switch (strFileExt)
    {
      case ".asp":
        strContentType = "application/asp";
       break;

      case ".htm":
      case ".html":
        strContentType = "text/html";

       break;

      case ".css":
        strContentType = "text/css";
       break;

    }
    // TODO Provide complete implementation, based on server configuration
  }

  return(strContentType);
}

function HttpRequestMappedFile(request)
{
  var strRequestedPath = url.parse(request.url).pathname;
  var strMappedPath = osASPGetMappedFile(strRequestedPath);
  return(strMappedPath);
}

function osASPGetMappedFile(strVirtualPath)
{
  // TODO Implement with configuration file
  var strMappedPath = strVirtualPath.replace(/^\/lutecia/, "/Replay/Sources/lutecia/devpt/wwwroot");
  return(strMappedPath);
}

function HttpRequestProcess(req, res) {
  var strDoc = HttpRequestMappedFile(req);
  if (HttpRequestMimeTypeIsASP(strDoc))
  {
    // TODO Implement ASP parser and return rendered HTML
    console.log("EXECUTE ASP SCRIPT \""+strDoc+"\"\n");
    var strRealPath = fs.realpathSync(strDoc);

    var strTemplate = osASPLoadTemplate(strRealPath);
    
    // TODO Implement cache for templates
    fs.writeFileSync(strRealPath+".cache", strTemplate);
    
    // Render and return data
    // TODO Let the ASP page handle binary data too (and possibly content-type!)
    res.end(ejs.render(strTemplate));

  }
  else
  {
    // Just return the requested document (image, css, client-side javascript, etc...)
    var strRealPath = fs.realpathSync(strDoc);

    var strContentType = HttpRequestGetContentType(strDoc);
    res.writeHead(200, {'Content-Type': strContentType});

    // Check method - only GET is allowed for static docs
    if (req.method !== 'GET') {
      res.writeHead(400);
      res.end("HTTP 400 BAD REQUEST\n");
      return;
    }
    console.log("RETURN FILE \""+strDoc+"\" (" + strContentType + ")\n");

    // Use a stream to transfer the requested file to the response
    var s = fs.createReadStream(strRealPath);
    s.on('error', function () {
      res.writeHead(404);
      res.end("HTTP 404 NOT FOUND\n");
    });
    s.once('fd', function () {
      req.writeHead(200);
    });
    s.pipe(res);
  }
}

function osASPLoadTemplate(strRealPath)
{
  // TODO Implement full template loader (handling include, server-side includes, etc...)
  // TODO Implement case-insensitive loader (!) e.g. time.js => Time.js
  if (!path.existsSync(strRealPath))
  {
    throw new Error("Can't include file "+strRealPath);
  }
  var objTemplate = fs.readFileSync(strRealPath);
  
  // TODO Implement cache for loaded template (maybe after COMPILATION of template?)
  var arrTemplate = objTemplate.toString().split("\r\n");
  if (arrTemplate[0].match(/^<%@.*%>/))
  {
    // TODO fetch encoding information from the first line as well as language name (vbscript IS NOT SUPPORTED)
    // Remove first line <%@ ... %> (it does NOT contain valid javascript)
    console.log("REMOVE LINE <%@ ... %>");
    arrTemplate.splice(0,1);
  }

  // TODO Provide real implementation for includes (this is a ugly hack)
  for (var intLine = 0; intLine < arrTemplate.length; intLine++)
  {
    var arrIncludeVirtual = arrTemplate[intLine].match(/^\<\!--#include virtual="([^"]+)"--\>$/);
    if (arrIncludeVirtual)
    {
      // Replace include by content of file - recursively
      var strSubVirtualPath = arrIncludeVirtual[1];
      console.log("include virtual=\""+strSubVirtualPath+"\"");
      var strSubRealPath = osASPGetMappedFile(strSubVirtualPath);
      console.log("Real Path=\""+strSubRealPath+"\"");
      arrTemplate[intLine] = osASPLoadTemplate(strSubRealPath);
    }
    var arrIncludeScript = arrTemplate[intLine].match(/^\<script language="javascript" src="([^"]+)" runat="server"\>\<\/script\>$/);
    if (arrIncludeScript)
    {
      // Replace include by content of file - recursively
      var strSubVirtualPath = arrIncludeScript[1];
      console.log("include script=\""+strSubVirtualPath+"\"");
      var strSubRealPath = osASPGetMappedFile(strSubVirtualPath);
      console.log("Real Path=\""+strSubRealPath+"\"");
      arrTemplate[intLine] = osASPLoadTemplate(strSubRealPath);
    }
  }

  var strTemplate = arrTemplate.join("\r\n");

  return(strTemplate);
}

