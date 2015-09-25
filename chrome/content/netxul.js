var step = 0;
var transport;
var stream;
var outstream;
var instream;
var pump;
var netsoul_username;
var netsoul_password;
var netsoul_server;
var netsoul_sport;
var netsoul_location;
var netsoul_comment;
var netsoul_watch_list;
var netsoul_watch_blist;
var netsoul_auto_connect;
var netsoul_auto_reconnect;
var prefManager;
var flag = 0;
var load = 0;


function save(savefile, data) 
{
  const DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1","nsIProperties");
  try { 
    path=(new DIR_SERVICE()).get("ProfD",
    Components.interfaces.nsIFile).path; 
  } catch (e) {
    alert("error");
  }
  // determine the file-separator
  if (path.search(/\\/) != -1) {
    path = path + "\\";
  } else {
    path = path + "/";
  }

  try {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    } catch (e) {
      netxul_debug("Permission to save file " + path + escape(savefile) + " was denied.");
    }
    var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(path + escape(savefile));
    if ( file.exists() == false ) {
      netxul_debug( "Creating file... " );
    file.create(
    Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420 );
  }
  var foutputStream =
  Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(
  Components.interfaces.nsIFileOutputStream );

  /* Open flags 
 #define PR_RDONLY       0x01
 #define PR_WRONLY       0x02
 #define PR_RDWR         0x04
 #define PR_CREATE_FILE  0x08
 #define PR_APPEND      0x10
 #define PR_TRUNCATE     0x20
 #define PR_SYNC         0x40
 #define PR_EXCL         0x80
 */

  foutputStream.init( file, 0x04 | 0x08 | 0x10, 0666, 0 );
  var output = data;
  var result = foutputStream.write( output, output.length );
  foutputStream.close();
}

function read(savefile)
{
  const DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1","nsIProperties");
  try { 
    path=(new DIR_SERVICE()).get("ProfD",
    Components.interfaces.nsIFile).path; 
  } catch (e) {
    alert("read error : " + e);
  }
  // determine the file-separator
  if (path.search(/\\/) != -1) {
    path = path + "\\";
  } else {
    path = path + "/";
  }

  try {
     netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  } catch (e) {
    netxul_debug("Permission to read file " + path + escape(savefile) + " was denied.");
  }
  var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  file.initWithPath(path + escape(savefile));
  if (file.exists() == false) {
    netxul_debug("File " + path + escape(savefile) + " does not exist");
  }
  var is = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
  try {
  is.init( file,0x01, 00004, null);
  var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
  sis.init(is);
  var output = sis.read(sis.available());
  return(output);
  } catch (e) {
    netxul_debug("Conversation toute neuve ... Pas d'archive a lire");
    return ("");
  }
}

function get_krb_token()
{
  var kerberosService = Components.classes["@mozilla.org/network/auth-module;1?name=kerb-gss"];
}

function change_status(state)
{
  var d = new Date();
  writeSocket("state " + state + ":" + d.getTime()/1000 + "\n");
}

function get_hour()
{
  var d = new Date();
  var hour = d.getHours();
  var minute = d.getMinutes();
  var second = d.getSeconds();
  if (hour < 10)
    hour = "0" + hour;
  if (minute < 10)
    minute = "0" + minute;
  if (second < 10)
    second = "0" + second;
  return (hour + ":" + minute + ":" + second);
}

function horreur()
{
  var main_window = document.getElementById("main-window");
  var recup = main_window.getAttribute("onunload");
  main_window.setAttribute("onunload", "netxul_disconnect();" + recup);
}

function read_conf()
{
  prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  try {load = prefManager.getIntPref("extensions.netxul.defaultNsLoad");}
  catch (e) {prefManager.setIntPref("extensions.netxul.defaultNsLoad", 0);load = prefManager.getIntPref("extensions.netxul.defaultNsLoad");}

  if (load == 0)
  {
    netxul_debug("Lecture de la configuration ...");
    try
    {
      prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

      try
      {
        netsoul_username = prefManager.getCharPref("extensions.netxul.defaultNsUser");
        netsoul_password = prefManager.getCharPref("extensions.netxul.defaultNsPasswd");
        netsoul_server = prefManager.getCharPref("extensions.netxul.defaultNsServer");
        netsoul_port = prefManager.getCharPref("extensions.netxul.defaultNsPort");
        netsoul_location = prefManager.getCharPref("extensions.netxul.defaultNsLocation");
        netsoul_comment = prefManager.getCharPref("extensions.netxul.defaultNsComment");
        netsoul_watch_list = prefManager.getCharPref("extensions.netxul.defaultNsList");
        netsoul_watch_blist = prefManager.getCharPref("extensions.netxul.defaultNsBlackList");
        netsoul_auto_connect = prefManager.getBoolPref("extensions.netxul.defaultNsAutoConnect");
        netsoul_auto_reconnect = prefManager.getBoolPref("extensions.netxul.defaultNsAutoReconnect");
      }
      catch (ex)
      {
        alert("Please Set the netsoul parameters in\nPreferences->NetXul\nThanks :)\n");
	netxul_load_default_values();
      }
      netxul_debug("OK");
      get_krb_token();
    }
    catch (ex)
    {
      alert(ex);
    }
    if (netsoul_auto_connect)
      netxul_connect();
    prefManager.setIntPref("extensions.netxul.defaultNsLoad", 1);
  }
  else
  {
    var view_netxul = document.getElementById("netxul");
    view_netxul.setAttribute("hidden", "true");
    view_netxul = document.getElementById("netxul_dialog");
    view_netxul.setAttribute("hidden", "true");  
  }
  horreur();
}

function implode(symb,array)
{
  var len = array.length;
  var fin = '';

  for (i = 0; i < len;i++)
  {
    if (i)
      fin += symb;
    fin +=array[i];
  }
  return (fin);
}

function contact_flyed()
{
  var dest;
  var sock;
  var location;
  var tree = document.getElementById("contacts_tree");
  var selection = tree.contentView.getItemAtIndex(tree.currentIndex);
  try {
      var children = selection.firstChild;
      for (var i = 0; i < children.childNodes.length; i++)
      {
        var plop = children.childNodes[i];
	if (plop.getAttribute("id") == "socket")
	  sock = plop.getAttribute("label");
	if (plop.getAttribute("id") == "location")
	  location = plop.getAttribute("label");
	if (plop.getAttribute("id") == "login")
	  dest = plop.getAttribute("label");
      }
  }
  catch (ex)
  {
    netxul_debug("CONTACT_SELECTED" + ex);
  }
  netxul_debug(dest + "flyed !");
}

function contact_selected()
{
  var dest;
  var sock;
  var location;
  var tree = document.getElementById("contacts_tree");
  var selection = tree.contentView.getItemAtIndex(tree.currentIndex);
  try {
      var children = selection.firstChild;
      for (var i = 0; i < children.childNodes.length; i++)
      {
        var plop = children.childNodes[i];
	if (plop.getAttribute("id") == "socket")
	  sock = plop.getAttribute("label");
	if (plop.getAttribute("id") == "location")
	  location = plop.getAttribute("label");
	if (plop.getAttribute("id") == "login")
	  dest = plop.getAttribute("label");
      }
  }
  catch (ex)
  {
    netxul_debug("CONTACT_SELECTED" + ex);
  }
  send_new_msg_direct(dest + "@" + location, ":" + sock); //":" + sock);
}

function add_buddy(login)
{
  var newlistitem;
  newlistitem = document.createElement("treeitem");
  newlistitem.setAttribute("id", login + "_locations");
  newlistitem.setAttribute("container", "true");
  newlistitem.setAttribute("open", "true");
    
  var newloginrow = document.createElement("treerow");
  var newloginvalue = document.createElement("treecell");
  newloginvalue.setAttribute("label", login);
  newloginrow.appendChild(newloginvalue);
  newlistitem.appendChild(newloginrow);
  return (newlistitem);
}

function add_location(login, location, status, comment, socket, where)
{
  try
  {
    var newlistitem;
    var list_contacts = document.getElementById("contacts");
    var exist;
    if (document.getElementById(login + "_locations") == null)
      newlistitem = add_buddy(login)
    else
      newlistitem = document.getElementById(login + "_locations");

    var newloginlocation;
    var newlocationitem;
    var newlocationrow;
    var newcell_user;
    var newcell_location;
    var newcell_status;
    var newcell_status_icn;
    var newcell_comment;
    var newcell_socket;
    var newcell_where;
    if (document.getElementById(login + "_" + location + "_row_" + socket) == null)
    {
      if (document.getElementById("login_location_" + login) == null)
      {
        newloginlocation = document.createElement("treechildren");
        newloginlocation.setAttribute("id", "login_location_" + login);
      }
      else
      {
        newloginlocation = document.getElementById("login_location_" + login);
      }
      newlocationitem = document.createElement("treeitem");
      newlocationitem.setAttribute("id", location);
      newlocationrow = document.createElement("treerow");
      newlocationrow.setAttribute("id", login + "_" + location + "_row_" + socket);

      newcell_user = document.createElement("treecell");
      newcell_location = document.createElement("treecell");
      newcell_status = document.createElement("treecell");
      newcell_status_icn = document.createElement("treecell");
      newcell_comment = document.createElement("treecell");
      newcell_socket = document.createElement("treecell");
      newcell_where = document.createElement("treecell");

      newlocationrow.appendChild(newcell_status_icn);
      newlocationrow.appendChild(newcell_location);
      newlocationrow.appendChild(newcell_status);
      newlocationrow.appendChild(newcell_comment);
      newlocationrow.appendChild(newcell_socket);
      newlocationrow.appendChild(newcell_user);
      newlocationrow.appendChild(newcell_where);
      newlocationitem.appendChild(newlocationrow);
      newloginlocation.appendChild(newlocationitem);
      newlistitem.appendChild(newloginlocation);
      list_contacts.appendChild(newlistitem);
    }
    else
    {
      newloginlocation = document.getElementById("login_location_" + login);
      newlocationitem = newloginlocation.firstChild;
      newlocationrow = document.getElementById(login + "_" + location + "_row_" + socket);
      var children = newloginlocation;

      for (var i = 0; i < children.childNodes.length; i++)
      {
        var plop = children.childNodes[i].firstChild;
	if (plop.getAttribute("id") == "login")
	   newcell_user = plop;
	if (plop.getAttribute("id") == "location")
	   newcell_location = plop;
	if (plop.getAttribute("id") == "status")
	   newcell_status = plop;
	if (plop.getAttribute("id") == "status_icn")
	   newcell_status_icn = plop;
	if (plop.getAttribute("id") == "comment")
	   newcell_comment = plop;
	if (plop.getAttribute("id") == "socket")
	   newcell_socket = plop;
	if (plop.getAttribute("id") == "where")
	   newcell_where = plop;
      }
    }
    newcell_location.setAttribute("label", decodeURIComponent(location));
    newcell_location.setAttribute("id", "location");

    newcell_status.setAttribute("label", status);
    newcell_status.setAttribute("id", "status");

    newcell_socket.setAttribute("label", socket);
    newcell_socket.setAttribute("id", "socket");

    if (where != "")
      newcell_where.setAttribute("label", where);
    newcell_where.setAttribute("id", "where");

    newcell_status_icn.setAttribute("id", "status_icn");
    newcell_status_icn.setAttribute("src", "chrome://netxul/content/" + status + ".png");

    newcell_user.setAttribute("label", login);
    newcell_user.setAttribute("id", "login");

    if (comment != "")
      newcell_comment.setAttribute("label", decodeURIComponent(comment));
    newcell_comment.setAttribute("id", "comment");
  }
  catch (ex)
  {
    netxul_debug("ADD LOCATION :: " + ex);
  }
}

function rm_contacts()
{
  try
  {
    var list = netsoul_watch_list.split(',');
    for (var contact in list.sort())
      if (document.getElementById("login_location_" + list[contact]) != null)
      {
        var children = document.getElementById("login_location_" + list[contact]);
        for (var i = 0; i < children.childNodes.length; i++)
        {
          var plop = children.childNodes[i];
  	  plop.parentNode.removeChild(plop);
        }
      }
  }
  catch (ex)
  {
    netxul_debug(ex);
  }
}

function do_contact()
{
  try
  {
    var list = netsoul_watch_list.split(',');
    for (var contact in list.sort())
      writeSocket("user_cmd who " + list[contact] + "\n");
    var watch_log_user = "{" + netsoul_watch_list + "}";
    writeSocket("user_cmd watch_log_user " + watch_log_user + "\n");
  }
  catch (ex)
  {
    netxul_debug(ex);
  }
}

function getTransport(host, port)
{
    var transportService =
      Components.classes["@mozilla.org/network/socket-transport-service;1"]
        .getService(Components.interfaces.nsISocketTransportService);
    var transport = transportService.createTransport(null,0,host,port,null);
    return transport;
}

function writeSocket(outputData)
{
	netxul_debug(outputData);
  try 
  {
    outstream.write(outputData,outputData.length);
  } 
  catch(e) 
  {
    alert(e);
  }
}

function readSocket(listener)
{
  try 
  {
    var dataListener = 
    {
      data : "",
      onStartRequest: function(request, context)
      {
//        netxul_debug("attente reponse ...");
      },
      onStopRequest: function(request, context, status)
      {
        netxul_debug("Connexion closed by server");
	if (netsoul_auto_reconnect)
	  if (flag == 0)
  	    netxul_connect();
      },
      onDataAvailable: function(request, context, inputStream, offset, count)
      {
        this.data = instream.read(count);
	netxul_debug(this.data);
        listener.finished(this.data);
      },
    };
    pump.init(stream, -1, -1, 0, 0, false);
    pump.asyncRead(dataListener,null);
  } 
  catch (ex)
  {
    return ex;
  }

  return null;
}

function netxul_debug(text)
{
  var debug = document.getElementById("debug");
  debug.value += text
  debug.value += "\n";
}

function do_dialog(from, sock)
{
  var newsend = document.createElement("button");
  var newclose = document.createElement("button");
  var newbuttons = document.createElement("vbox");
  var newvbox = document.createElement("vbox");
  var newtextboxdialogfr = document.createElement("iframe");
  var newhbox2 = document.createElement("hbox");
  var newtextboxmsg = document.createElement("textbox");
  var newimage = document.createElement("image");
  var tapotimage = document.createElement("image");

  newsend.setAttribute("label", "Send");
  newsend.setAttribute("oncommand", "send_msg('" + sock + "', '" + from + "');");

  newclose.setAttribute("label", "Close");
  newclose.setAttribute("oncommand", "close_tab('" + from + "');");
  newvbox.setAttribute("flex", "1");

  newtextboxdialogfr.setAttribute("id", "dialogfr_" + from);
  newtextboxdialogfr.setAttribute("align", "bottom");

  newtextboxmsg.setAttribute("multiline", "false");
  newtextboxmsg.setAttribute("id", "msg_" + from);
  newtextboxmsg.setAttribute("rows", "1");
  newtextboxmsg.setAttribute("flex", "1");
  newtextboxmsg.setAttribute("maxlength", "256");

  var photo_url = "http://www.epitech.net/intra/photo.php?login=" + from.split('@')[0];
  newimage.setAttribute("src", photo_url);
  newimage.setAttribute("width", "75");
  newimage.setAttribute("height", "105");
  newimage.setAttribute("id", "photo_" + from);

  tapotimage.setAttribute("src", "chrome://netxul/content/clavier.png");
  tapotimage.setAttribute("width", "32")
  tapotimage.setAttribute("height", "32")
  tapotimage.setAttribute("hidden", "true");
  tapotimage.setAttribute("id", "tapot_" + from);

  newbuttons.appendChild(newsend);
  newbuttons.appendChild(newclose);
  newbuttons.appendChild(tapotimage);

  newvbox.appendChild(newtextboxdialogfr);

  newhbox2.appendChild(newimage);
  newhbox2.appendChild(newtextboxmsg);
  newhbox2.appendChild(newbuttons);

  newvbox.appendChild(newhbox2);

  return (newvbox);
}

function close_tab(from)
{
  var tabpanel_toremove = document.getElementById("tabpanel_" + from);
  var tab_toremove = document.getElementById("tab_" + from);
  var tabpanels = document.getElementById("netxul_tabpanels");
  var tabs = document.getElementById("netxul_tabs");
  tabs.removeChild(tab_toremove);
  tabpanels.removeChild(tabpanel_toremove);

  tabs.firstChild.setAttribute("selected", "true");
}

function sleep(millis)
{
        date = new Date();
        var curDate = null;

        do
        {
                var curDate = new Date();
        }while(curDate-date < millis);
}

function update_history(from)
{
  var iframe = document.getElementById("dialogfr_" + from);
  var data = read(from + ".log") + "<br><hr>";
  data = data.replace(/\[:([\s\w\W]*)\]/g, "<img src='http://forum.hardware.fr/images/perso/$1.gif' align='middle' alt='$1'/>");
  data = data.replace(/\[([\s\w\W]*):\]/g, "<img src='http://www.pcinpact.com/images/smiles/$1.gif' align='middle' alt='$1'/>");
  iframe.contentWindow.document.body.innerHTML = data;
try{  
  iframe.contentWindow.scrollTo(0,5000000);
} catch (e) {netxul_debug(e);}
}

function show_dialog(from, sock)
{
  var netxul_tabs = document.getElementById("netxul_tabs");
  if (document.getElementById("tab_" + from) == null)
  {
    var netxul_tabpanels = document.getElementById("netxul_tabpanels");
    var newtab = document.createElement("tab");
    var newtabpanel = document.createElement("tabpanel");

    newtabpanel.setAttribute("id", "tabpanel_" + from);
    newtabpanel.setAttribute("flex", "1");

    newtab.setAttribute("id", "tab_" + from);
    newtab.setAttribute("label", from);

    var childNodes = netxul_tabs.childNodes;
    for (var i = 0; i < childNodes.length; i++)
    {
      var child = childNodes[i];
      child.removeAttribute("selected");
    }
    newtab.setAttribute("selected", "true");

    var dialog = do_dialog(from, sock);

    netxul_tabs.appendChild(newtab);
    newtabpanel.appendChild(dialog);
    netxul_tabpanels.appendChild(newtabpanel);
    // grosse feinte de la mort pour remplir l'iframe ...
    // gruiiiiiiiiiiiiikkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk !
    setTimeout("update_history('" + from + "')", 100);
  }
}

function netxul_connect()
{

//    var env = Components.classes["@mozilla.org/process/environement;1"];
//    alert(env.exists("NS_USER_LINK"));
    
  if (load == 0)
  {
  var progress = document.getElementById("progress");
  progress.value = "1";
  flag = 0;  
  progress.value = "20";
  
  netxul_debug("Lancement de la connexion ...");
  netxul_debug("Initialisation de la connexion ...");
  transport = getTransport(netsoul_server, netsoul_port);
  stream = transport.openInputStream(0,0,0);
  outstream = transport.openOutputStream(1,0,0);
  instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
  instream.init(stream);
  pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
  netxul_debug("OK");

  var d;

  var first_connect = {

    tab         : "",
    salut       : "",
    socket      : "",
    rand_md5    : "",
    host_client : "",
    port_client : "",
    timestamp   : "",

    finished : function(data){
    try 
    {
      if (step == 0)
      {
        netxul_debug("demande d'auth ...");
	var tab = data.split(" ");
	this.salut = tab[0];
	this.socket = tab[1];
	this.rand_md5 = tab[2];
	this.host_client = tab[3];
	this.port_client = tab[4];
	this.timestamp = tab[5];
	progress.value = "40";
	writeSocket("auth_ag ext_user none none\n");
	step = 1;
	readSocket(first_connect);
      }
      else if (step == 1)
      {
	if (data != "rep 002 -- cmd end\n")
	{
	  netxul_debug("authentification refusee !");
	}
	else
	  netxul_debug("OK\nenvoi de l'identification ...");
	progress.value = "60";
        var rep_clr = first_connect.rand_md5 + "-" + first_connect.host_client + "/" + first_connect.port_client + netsoul_password;
        var rep_md5 = hex_md5(rep_clr);
        var rep = "ext_user_log " + netsoul_username + " " + rep_md5 + " " + encodeURIComponent(netsoul_location) + " " + encodeURIComponent(netsoul_comment) + "\n";
        writeSocket(rep);
	step = 2;
        readSocket(first_connect);
      }
      else if (step == 2)
      {
	if (data != "rep 002 -- cmd end\n")
	{
	  netxul_debug("authentification ratee !");
	}
	else
	  netxul_debug("OK");
	progress.value = "80";
	d = new Date();
        writeSocket("state actif:" + d.getTime()/1000 + "\n");
	do_contact();
	progress.value = "100";
	step = 3;
      }
      else
      {
//        netxul_debug(data);
	if (data.match("^ping") != null)
	{
	  writeSocket(data);
	}
	if (data.match("^user_cmd") != null)
	{
	  var msg_cmd = data.split(" ");
	  var ident = msg_cmd[1];
	  var cmd = msg_cmd[3];
	  var cmd_data = msg_cmd[4];
	  var dst = msg_cmd[5];
	  var mail_from = msg_cmd[5];
	  var mail_subj = msg_cmd[6];
	  var msg_ident = ident.split(":");
	  var socket = msg_ident[0];
	  var trust_level = msg_ident[2];
	  var from = msg_ident[3];
	  var login = from.split("@")[0];
	  var where = from.split("@")[1];
	  var workstation_type = msg_ident[4];
	  var location = msg_ident[5];
	  var group = msg_ident[6];

	  if (cmd == "msg")
	  {
	    var blist = netsoul_watch_blist.split(',');
            for (var chieur in blist)
              if (login == chieur)
	      {
	        netxul_debug("Le chieur " + login + "a ete evite !");
	        break;
	      }
	    show_dialog(login + "@" + decodeURIComponent(location), ":" + socket);
            var iframe = document.getElementById("dialogfr_" + login + "@" + decodeURIComponent(location));

	    d = new Date();
	    var data;

	    data = "<font color='blue'><strong>(";
	    data += get_hour();
	    data += ")</strong> ";
	    data += login;
	    data += "@";
	    data += decodeURIComponent(location);
	    data += " : </font>";
	    try {data += decodeURIComponent(cmd_data) + "\n";}
	    catch (e) {data += unescape(cmd_data) + "\n";}
	    data += "<br>";
	    data = data.replace(/\[:([\s\w\W]*)\]/g, "<img src='http://forum.hardware.fr/images/perso/$1.gif' align='middle' alt='$1'/>");
	    data = data.replace(/\[([\s\w\W]*):\]/g, "<img src='http://www.pcinpact.com/images/smiles/$1.gif' align='middle' alt='$1'/>");
	    sleep(100);
            iframe.contentWindow.document.body.innerHTML += data;
	    iframe.contentWindow.scrollTo(0,5000000);

	    save(login + "@" + decodeURIComponent(location) + ".log", data);
	  }else
	  if (cmd == "new_mail")
	  {
  	    netxul_debug("Oh ! un mail : " + decodeURIComponent(mail_from) + " " + decodeURIComponent(mail_subj));
	  }else
	  if (cmd == "login")
	  {
	    netxul_debug("login de " + login);
	    add_location(login, location, cmd_data.split(':')[0], "", socket, "");
            writeSocket("user_cmd who " + login + "\n");
	  }else
	  if (cmd == "state")
	  {
	    if (document.getElementById("login_location_" + login) == null)
	      add_location(login, location, cmd_data.split(':')[0], "", socket, "");
	    var children = document.getElementById("login_location_" + login);
	    for (var i = 0; i < children.childNodes.length; i++)
	    {
	      var plop = children.childNodes[i];
	      if (plop.getAttribute("id") == location)
	      {
	        for(var j = 0; j < plop.childNodes.length; j++)
		{
		  var cell = plop.childNodes[j].firstChild;
		  if (cell.getAttribute("id") == "location")
		    cell.setAttribute("label", decodeURIComponent(location));
		  if (cell.getAttribute("id") == "comment")
		    cell.setAttribute("label", decodeURIComponent(comment));
		  if (cell.getAttribute("id") == "status")
		    cell.setAttribute("label", decodeURIComponent(cmd_data.split(':')[0]));
		  if (cell.getAttribute("id") == "status_icn")
		    cell.setAttribute("src", "chrome://netxul/content/" + cmd_data.split(':')[0] + ".png");
		}
	      }
	    }
	  }else
	  if (cmd == "logout")
	  {
	    if (document.getElementById("login_location_" + login) != null)
	    {
 	      var children = document.getElementById("login_location_" + login);
	      for (var i = 0; i < children.childNodes.length; i++)
	      {
	        var plop = children.childNodes[i];
	        if (plop.getAttribute("id") == location)
	        {
		  plop.parentNode.removeChild(plop);
		}
	      }
	    }
	  }else
	  if ((cmd == "dotnetSoul_UserTyping") || (cmd == "typing_start"))
	  {
	    show_dialog(login + "@" + decodeURIComponent(location), login);
            var iframe = document.getElementById("dialogfr_" + login + "@" + decodeURIComponent(location));
	    var tapot = document.getElementById("tapot_"  + login + "@" + decodeURIComponent(location));
	    tapot.setAttribute("hidden", "false");
try {	    setTimeout("document.getElementById('tapot_'"  + login + "'@'" + "decodeURIComponent(" + location + ")).setAttribute('hidden', 'true')", 8000);}
catch (e)
{
	netxul_debug(e);
}
	  }else
	  if ((cmd == "dotnetSoul_UserCancelledTyping") || (cmd == "typing_end"))
	  {
	    show_dialog(login + "@" + decodeURIComponent(location), login);
            var iframe = document.getElementById("dialogfr_" + login + "@" + decodeURIComponent(location));
	    var tapot = document.getElementById("tapot_"  + login + "@" + decodeURIComponent(location));
	    tapot.setAttribute("hidden", "true");
	  }else
	  if ((cmd == "who"))
	  {
	    lines = data.split('\n');
	    try{
	    for (var line in lines)
	    {
	      if (lines[line] == "")
	        continue;
	      msg_cmd = lines[line].split(" ");
	      ident = msg_cmd[1];
	      cmd = msg_cmd[3];

              var who_socket = msg_cmd[4];
	      if (who_socket == "rep")
	        continue;
    	      //netxul_debug(lines[line]);
              var who_login = msg_cmd[5];
              var who_user_host = msg_cmd[6];
              var who_login_timestamp = msg_cmd[7];
              var who_last_change_timestamp = msg_cmd[8];
              var who_trust_level_low = msg_cmd[9];
              var who_trust_level_high = msg_cmd[10];
              var who_workstation_type = msg_cmd[11];
              var who_location = msg_cmd[12];
              var who_group = msg_cmd[13];
try {              var who_state_status = msg_cmd[14].split(':')[0];
              var who_state_timestamp = msg_cmd[14].split(':')[0];}
catch (e)
{
	netxul_debug(e);
	netxul_debug(lines[line]);
}
              var who_comment = msg_cmd[15];
	      add_location(who_login, who_location, who_state_status, who_comment, who_socket, who_user_host);
	    }
	      } catch (ex) {
	        netxul_debug(ex);
	      }

	  }else
	  if ((cmd == "who") && (cmd_data == "rep"))
	  {
	  }else
	  netxul_debug("cmd :: " + cmd + " not implemented !");
	}
      }
    }
    catch (ex)
    {
      netxul_debug(ex);
    }
    }
  }
  netxul_debug("Discussion avec le serveur netsoul :");
  readSocket(first_connect);
  }
}

function netxul_disconnect()
{
  rm_contacts();
  prefManager.setIntPref("extensions.netxul.defaultNsLoad", 0);
  flag = 1;
  writeSocket("exit" + "\n");
  try {
  stream.close();
  outstream.close();
  instream.close();
  }
  catch (ex)
  {
  }
  step = 0;
  netxul_debug("Disconnected");
  var progress = document.getElementById("progress");
  progress.value = "1";
  return true;
}

function send_new_msg(e)
{
  if (e.keyCode == e.DOM_VK_RETURN)
  {
    e.stopPropagation();
    var to = document.getElementById("new_msg");
    from = to.value;
    to.value = "";
    show_dialog(from + "@anywhere", from);
    var photo_url = "http://www.epitech.net/intra/photo.php?login=" + from;
    photo = document.getElementById("photo_" + from);
    photo.setAttribute("src", photo_url);
  }
}

function send_new_msg_direct(from, sock)
{
    try {
    show_dialog(from, sock);
    var photo_url = "http://www.epitech.net/intra/photo.php?login=" + from.split("@")[0];
    photo = document.getElementById("photo_" + from);
    photo.setAttribute("src", photo_url);
    }
    catch (ex)	
    {
      netxul_debug(ex);
    }
}

function show_netxul()
{
  var check = document.getElementById("netxul_check_menu");
  var view_netxul = document.getElementById("netxul");

  if (check.getAttribute("checked") == "true")
    view_netxul.setAttribute("hidden", "false");
  else
    view_netxul.setAttribute("hidden", "true");

  view_netxul = document.getElementById("netxul_dialog");

  if (check.getAttribute("checked") == "true")
    view_netxul.setAttribute("hidden", "false");
  else
    view_netxul.setAttribute("hidden", "true");
}

function send_msg(to, ref)
{
	try {
  var msg = document.getElementById("msg_" + ref).value;
  writeSocket("user_cmd msg_user " + to.split("@")[0] + " msg " + encodeURIComponent(msg) + "\n");
  document.getElementById("msg_" + ref).value = "";
  var iframe = document.getElementById("dialogfr_" + ref);
  var d = new Date();
  }
  catch (ex)
  {
    netxul_debug(ex);
  }

try {

  var data;
  data = "<font color='red'><strong>(";
  data += get_hour();
  data += ")</strong> ";
  data += netsoul_username;
  data += "@";
  data += decodeURIComponent(netsoul_location);
  data += " : </font>";
  data += msg + "\n";
  data += "<br>";
  data = data.replace(/\[:([\s\w\W]*)\]/g, "<img src='http://forum.hardware.fr/images/perso/$1.gif' align='middle' alt='$1'/>");
  data = data.replace(/\[([\s\w\W]*):\]/g, "<img src='http://www.pcinpact.com/images/smiles/$1.gif' align='middle' alt='$1'/>");
  iframe.contentWindow.document.body.innerHTML += data;
  iframe.contentWindow.scrollTo(0,5000000);
  save(ref + ".log", data);
} catch (ex)
{
  netxul_debug(ex);
}

}

function onKeyDown(e)
{
  if (e.keyCode == e.DOM_VK_RETURN)
  {
    e.stopPropagation();
  }
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
