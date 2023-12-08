import AesCtr from './aes-ctr.js';
import hash from './hash.js';

import {getCurrentTab, changeMyPassword, addTabDataStorage, loadTabs, showMyTabs, keepMeSafe, mainScreen} from "./dataHandler.js";
// favIconUrl, url
const addTabData = document.querySelector(".addTabData");
const decrypt = document.querySelector(".decrypt");
const setPassword = document.querySelector(".setPassword");
const changePassword = document.querySelector(".changePassword");
const addTabManually = document.querySelector(".addTabManually");

const localStorage = chrome.storage.local;
const sessionStorage = chrome.storage.session;


//password input field
var passwordInput = document.createElement("INPUT");
var passwordVerifyInput = document.createElement("INPUT");
var urlInput = document.createElement("INPUT");
var nameInput = document.createElement("INPUT");
refreshPasswordInput();
refreshPasswordVerifyInput();
refreshUrlInput();
refreshNameInput();

//submit password button
var submitButton = document.createElement("BUTTON");
var setPasswordButton = document.createElement("BUTTON");
var addTabManualSubmit = document.createElement("BUTTON");
var cancelButton = document.createElement("BUTTON");
refreshSubmitButton();
refreshSetPasswordButton();
refreshAddTabManualSubmit();
refreshCancelButton();

await keepMeSafe();
showMyTabs();

function refreshPasswordInput()
{
  passwordInput = document.createElement("INPUT");
  passwordInput.setAttribute("type", "password");
  passwordInput.setAttribute("id", "password");
  passwordInput.setAttribute("className", "password");
};
function refreshPasswordVerifyInput()
{
  passwordVerifyInput = document.createElement("INPUT");
  passwordVerifyInput.setAttribute("type", "password");
  passwordVerifyInput.setAttribute("id", "passwordVerify");
  passwordVerifyInput.setAttribute("className", "passwordVerify");
};
function refreshUrlInput()
{
  urlInput = document.createElement("INPUT");
  urlInput.setAttribute("type", "text");
  urlInput.setAttribute("id", "urlInput");
  urlInput.setAttribute("className", "urlInput");
  urlInput.setAttribute("placeholder", "urlInput");
};
function refreshNameInput()
{
  nameInput = document.createElement("INPUT");
  nameInput.setAttribute("type", "text");
  nameInput.setAttribute("id", "name");
  nameInput.setAttribute("className", "name");
  nameInput.setAttribute("placeholder", "nameInput");
};
function refreshSubmitButton()
{
  submitButton = document.createElement("BUTTON");
  submitButton.setAttribute("className", "submit");
  submitButton.setAttribute("type", "button");
  submitButton.innerText = "Confirm";
};
function refreshSetPasswordButton()
{
  setPasswordButton = document.createElement("BUTTON");
  setPasswordButton.setAttribute("className", "submit");
  setPasswordButton.setAttribute("type", "button");
  setPasswordButton.innerText = "Confirm";
};  
function refreshAddTabManualSubmit()
{
  addTabManualSubmit = document.createElement("BUTTON");
  addTabManualSubmit.setAttribute("className", "submit");
  addTabManualSubmit.setAttribute("type", "button");
  addTabManualSubmit.innerText = "Add";
};
function refreshCancelButton()
{
  cancelButton = document.createElement("BUTTON");
  cancelButton.setAttribute("className", "submit");
  cancelButton.setAttribute("type", "button");
  cancelButton.innerText = "Cancel";
  cancelButton.onclick = () =>
  {
    document.querySelector("ul").replaceChildren();
    showMyTabs();

    refreshPasswordInput();
    refreshPasswordVerifyInput();
    refreshUrlInput();
    refreshNameInput();
    refreshSubmitButton();
    refreshSetPasswordButton();
    refreshAddTabManualSubmit();
  }
};


setPassword.addEventListener("click", async () => {
  const currentHash = await localStorage.get(["passwordHash"]).then((result) => {
    return result.passwordHash;
  });

  if(currentHash === "First Use")
  {
    await document.querySelector("ul").append(passwordInput);
    await document.querySelector("ul").append(setPasswordButton);
    await document.querySelector("ul").append(passwordVerifyInput);

    setPasswordButton.addEventListener("click", async () => {
      const password = await document.getElementById("password");
      const passwordVerify = await document.getElementById("passwordVerify");
      if(password.value === passwordVerify.value)
      {
        await document.querySelector("ul").replaceChildren();
        refreshPasswordInput();
        refreshPasswordVerifyInput();
        refreshSetPasswordButton();
        await localStorage.set({"passwordHash":hash(password.value)});
        await sessionStorage.set({"password":password.value});
        await sessionStorage.set({"isEncrypted":"False"});
        mainScreen();
      }
  });
  }
});

decrypt.addEventListener("click", async () => {
  const isEncrypted = await sessionStorage.get(["isEncrypted"]).then((result) => {
    return result.isEncrypted;
  });
  const currentHash = await localStorage.get(["passwordHash"]).then((result) => {
    return result.passwordHash;
  });
  if(isEncrypted == "True" && currentHash !== "First Use")
  {
    await document.querySelector("ul").append(passwordInput);
    await document.querySelector("ul").append(submitButton);

    submitButton.addEventListener("click", async () => {
      const hashCheck = await document.getElementById("password");
      const hashedPass = await localStorage.get(["passwordHash"]).then((result) => {
        return result.passwordHash;
      });

      if(hashedPass === hash(hashCheck.value))
      {
        passwordInput.parentElement.removeChild(passwordInput);
        submitButton.parentElement.removeChild(submitButton);
        refreshSubmitButton();
        refreshPasswordInput();
        sessionStorage.set({"password":hashCheck.value})
        loadTabs();
        showMyTabs();
        await sessionStorage.set({"isEncrypted":"False"});
      }
      else
      {
        //element.querySelector(".text").textContent = "wrongPassword";
      }
    });
  }
});

addTabData.addEventListener("click", async () => {
  const isEncrypted = await sessionStorage.get(["isEncrypted"]).then((result) => {
    return result.isEncrypted;
  });
  if(isEncrypted == "False")
  {
    var currTab = await getCurrentTab();
    console.log(currTab)
    if (currTab !== undefined)
    {
      const data = {"url":currTab.url, "favIcon":currTab.favIconUrl, "name":currTab.title}
      addTabDataStorage(data);
    }
  }
});

addTabManually.addEventListener("click", async () => {
  const isEncrypted = await sessionStorage.get(["isEncrypted"]).then((result) => {
    return result.isEncrypted;
  });

  if(isEncrypted === "False")
  {
    document.querySelector("ul").replaceChildren();

    
    await document.querySelector("ul").append(urlInput);
    await document.querySelector("ul").append(nameInput);
    await document.querySelector("ul").append(cancelButton);
    await document.querySelector("ul").append(addTabManualSubmit);

    addTabManualSubmit.addEventListener("click", async () => 
    {
      const url = await document.getElementById("urlInput");
      const name = await document.getElementById("name");   
      urlInput.parentElement.removeChild(urlInput);
      nameInput.parentElement.removeChild(nameInput);
      addTabManualSubmit.parentElement.removeChild(addTabManualSubmit); 
      refreshUrlInput();
      refreshNameInput();
      refreshAddTabManualSubmit();
      const data = {"url":url.value, "favIcon":"", "name":name.value};
     
      addTabDataStorage(data);
    });
  };
}); 

changePassword.addEventListener("click", async () => {
  const isEncrypted = await sessionStorage.get(["isEncrypted"]).then((result) => {
    return result.isEncrypted;
  });

  if(isEncrypted === "False")
  {
    document.querySelector("ul").replaceChildren();

    await document.querySelector("ul").append(passwordInput);
    await document.querySelector("ul").append(setPasswordButton);
    await document.querySelector("ul").append(passwordVerifyInput);
    await document.querySelector("ul").append(cancelButton);

    setPasswordButton.addEventListener("click", async () => {
      const password = await document.getElementById("password");
      const passwordVerify = await document.getElementById("passwordVerify");  
      if(password.value === passwordVerify.value)
      {
        await document.querySelector("ul").replaceChildren();
        refreshPasswordInput();
        refreshPasswordVerifyInput();
        refreshSetPasswordButton();
        await changeMyPassword(password.value);
        await localStorage.set({"passwordHash":hash(password.value)});
        await sessionStorage.set({"password":password.value});
        await sessionStorage.set({"isEncrypted":"False"});
      }
  });
  }
});