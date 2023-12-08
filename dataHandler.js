import AesCtr from './aes-ctr.js';
import hash from './hash.js';

const localStorage = chrome.storage.local;
const sessionStorage = chrome.storage.session;

function openScreen()
{
    document.querySelector(".OpenScreen").className = "OpenScreen"
    document.querySelector(".MainScreen").className = "MainScreen Hide"
}

function mainScreen()
{
    document.querySelector(".OpenScreen").className = "OpenScreen Hide"
    document.querySelector(".MainScreen").className = "MainScreen"
}

async function isDuplicate(data)
{
  var savedTabs = await sessionStorage.get(["savedTabs"]).then((result) => {
    return result.savedTabs;
  });
  if(savedTabs !== undefined)
  {
    for (const tab of savedTabs) {
      if(tab["url"] === data["url"])
      {
        return true;
      }
    }
  }
  return false;
}

async function getCurrentTab() 
{
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
  
//change the template to <a href=url>name</a> <img path=favIcon/>
function addTab(data) {
    var container = document.createElement("div");
    var icon = document.createElement("img");
    var text = document.createElement("div");

    container.className = "tabInfo";
    text.className = "tabName";
    icon.className = "favIcon";

    container.onclick = ()=>{chrome.tabs.create({ url: data["url"] });};
    text.textContent = data["name"];
    container.addEventListener('contextmenu', async function (event) {
        event.preventDefault();
        var confirmationContainer = document.createElement("div");
        confirmationContainer.className = "CancelDialog";

        var text = document.createElement("p");
        text.textContent = "Are you sure you want to remove " + data["name"] + "?";
        var confirm = document.createElement("BUTTON");
        confirm.textContent = "Confirm";
        confirm.onclick = async ()=>{
            await removeTab(data["name"]);
            showMyTabs();
        }
        var cancel = document.createElement("BUTTON");
        cancel.textContent = "Cancel";
        cancel.onclick = async ()=>{
            showMyTabs();
        }

        confirmationContainer.append(text);
        confirmationContainer.append(confirm);
        confirmationContainer.append(cancel);

        document.querySelector("ul").replaceChildren();
        document.querySelector("ul").append(confirmationContainer);
    });
    icon.src =  data["favIcon"];
    container.append(text);
    container.append(icon);

    document.querySelector("ul").append(container);
}

async function addTabDataStorage(data)
  {
    if( await isDuplicate(data) === false && data["url"] !== "" && (data["url"].includes("https://") || data["url"].includes("http://")))
    {
        const encKey = await sessionStorage.get(["password"]).then((result) => 
        {
            return result.password;
        });
        const encData = {"url":AesCtr.encrypt(data["url"], encKey, 256), "favIcon":AesCtr.encrypt(data["favIcon"], encKey, 256), "name":AesCtr.encrypt(data["name"], encKey, 256)}
        var localTabs = await localStorage.get(["savedTabs"]).then((result) => 
        {
            return result.savedTabs;
        });
        var sessionTabs = await sessionStorage.get(["savedTabs"]).then((result) => 
        {
            return result.savedTabs;
        });
        if(sessionTabs !== undefined)
        {
            await sessionStorage.set({"savedTabs":[...sessionTabs, data]})
        }
        else
        {
            await sessionStorage.set({"savedTabs":[data]})
        }
        if(localTabs !== undefined)
        {
            await localStorage.set({"savedTabs":[...localTabs, encData]})
        }
        else
        {
            await localStorage.set({"savedTabs":[encData]})
        }
    }
    showMyTabs()
}

async function loadTabs()
  {
    var savedTabs = await localStorage.get(["savedTabs"]).then((result) => {return result.savedTabs;});
    const encKey = await sessionStorage.get(["password"]).then((result) => {return result.password;});
  
    if(savedTabs !== undefined)
    {
      for (const tab of savedTabs) {
        var sessionTabs = await sessionStorage.get(["savedTabs"]).then((result) => {return result.savedTabs;});
        const data = 
        {
          "url":AesCtr.decrypt(tab["url"], encKey, 256), 
          "favIcon":AesCtr.decrypt(tab["favIcon"], encKey, 256), 
          "name":AesCtr.decrypt(tab["name"], encKey, 256)
        }
        if(sessionTabs !== undefined)
        {
          await sessionStorage.set({"savedTabs":[...sessionTabs, data]})
        }
        else{
          await sessionStorage.set({"savedTabs":[data]})
        }
      }
    }
    showMyTabs();
}

async function removeTab(tabName)
{
    const encKey = await sessionStorage.get(["password"]).then((result) => 
    {
        return result.password;
    });
    var savedTabs = await sessionStorage.get(["savedTabs"]).then((result) => {return result.savedTabs;});
    await sessionStorage.set({"savedTabs":[]});
    var filteredTabs = await sessionStorage.get(["savedTabs"]).then((result) => {return result.savedTabs;});
    for (const tab of savedTabs) 
    {
        if(tab["name"] !== tabName)
        {
            filteredTabs = await sessionStorage.get(["savedTabs"]).then((result) => {return result.savedTabs;});
            if(filteredTabs !== undefined)
            {
                await sessionStorage.set({"savedTabs":[...filteredTabs, tab]})
            }
            else
            {
                await sessionStorage.set({"savedTabs":[tab]})
            }
        }
    }
    await changeMyPassword(encKey);
}

async function changeMyPassword(password)
  {
    var savedTabs = await sessionStorage.get(["savedTabs"]).then((result) => {return result.savedTabs;});
    const encKey = password;
  
    if(savedTabs !== undefined)
    {
        await localStorage.set({"savedTabs":""})
        for (const tab of savedTabs) {
          var localTabs = await localStorage.get(["savedTabs"]).then((result) => {return result.savedTabs;});
        
          const data = 
          {
            "url":AesCtr.encrypt(tab["url"], encKey, 256), 
            "favIcon":AesCtr.encrypt(tab["favIcon"], encKey, 256), 
            "name":AesCtr.encrypt(tab["name"], encKey, 256)
          }

          if(localStorage !== undefined)
          {
            await localStorage.set({"savedTabs":[...localTabs, data]})
          }
          else{
            await localStorage.set({"savedTabs":[data]})
          }
        }
    }
}

async function showMyTabs()
{
    const isEncrypted = await sessionStorage.get(["isEncrypted"]).then((result) => 
    {
        return result.isEncrypted;
    });
    if(isEncrypted == "False")
    {
        mainScreen();
        document.querySelector("ul").replaceChildren();

        var savedTabs = await sessionStorage.get(["savedTabs"]).then((result) => {
          return result.savedTabs;
        });
        if(savedTabs !== undefined)
        {
          for (const tab of savedTabs) {
            addTab(tab);
          }
        }
    }
}

async function keepMeSafe()
{
    const isEncrypted = await sessionStorage.get(["isEncrypted"]).then((result) => {
        return result.isEncrypted;
    });
    const extraSafe = await localStorage.get(["extraSafe"]).then((result) => {
        return result.extraSafe;
    });

    if(isEncrypted == "False" && extraSafe == "True")
    {
        openScreen();
        await sessionStorage.clear();
        await sessionStorage.set({"isEncrypted":"True"});
    }
}
export {getCurrentTab,changeMyPassword,addTabDataStorage,loadTabs,showMyTabs,keepMeSafe, mainScreen};