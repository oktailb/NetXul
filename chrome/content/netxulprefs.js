function netxul_debug(text)
{
  var debug = document.getElementById("debug");
  debug.value += text
  debug.value += "\n";
}

function netxul_load_default_values()
{
  try
  {
    var hostname = "Home";
    var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    prefManager.setCharPref("extensions.netxul.defaultNsServer", "ns-server.epita.fr");
    prefManager.setCharPref("extensions.netxul.defaultNsPort", "4242");
    prefManager.setCharPref("extensions.netxul.defaultNsLocation", hostname);
    prefManager.setCharPref("extensions.netxul.defaultNsComment", "NetXul : The netsoul firefox extension (Say it NetZool)");
    prefManager.setBoolPref("extensions.netxul.defaultNsAutoConnect", true);
    prefManager.setBoolPref("extensions.netxul.defaultNsAutoReconnect", false);
  }
  catch (ex)
  {
    alert (ex);
  }
}
