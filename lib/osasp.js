//
// $Id: osasp-server.js 14 2011-08-12 18:46:36Z emmanuel $
//

// ASP built-in objects: Application, ASPError, ObjectContext, Request, Response, Server, Session

// TODO Shortcut for Application.Content("...") as a R-VALUE, e.g. Response.Write(Application("greeting"));

// TODO find a way to use the Application("...") shortcut as a L-VALUE, e.g. 
//     Application("greeting") = "Welcome to My Web World!"

// TODO Shortcut for Session.Content("...") as a R-VALUE, e.g. Response.Write(Session("firstname"));
// TODO find a way to use the Session("...") shortcut as a L-VALUE, e.g. 
//     Session("firstname") = "Emmanuel"


function osASP_Request()
{
}

function osASP_Response()
{
}

function osASP_Server()
{
}

function osASP_Session()
{
  this.Contents = osASP_Session_Contents;
}

function osASP_Session_Contents(strVariableName)
{
  // TODO Implement session variables
  return(null);
}

function osASP_Application()
{
  this.Contents = osASP_Application_Contents;
}

function osASP_Application_Contents(strVariableName)
{
  // TODO Implement application variables
  return(null);
}

// Create built-in objects AS GLOBALS
global.Request = new osASP_Request();
global.Response = new osASP_Response();
global.Server = new osASP_Server();
global.Session = new osASP_Session();
global.Application = new osASP_Application();

