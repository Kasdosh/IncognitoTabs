chrome.runtime.onStartup.addListener(async function() {
    const sessionStorage = chrome.storage.session;
    await sessionStorage.clear();
    await sessionStorage.set({"isEncrypted":"True"}); 
});

chrome.runtime.onInstalled.addListener(async function() {
  const localStorage = chrome.storage.local;
  const sessionStorage = chrome.storage.session;
  await sessionStorage.clear();
  await localStorage.clear()
  await sessionStorage.set({"isEncrypted":"True"}); 
  await localStorage.set({"passwordHash":"First Use"}); 
  await localStorage.set({"extraSafe":"True"}); 
});