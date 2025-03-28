let tabLoadedStates = {};

function handleError(error) {
  console.log(`Error: ${error}`);
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "set_current_active_tab") {
        const tabId = sender.tab.id;
        if (message.state) {
            tabLoadedStates[tabId] = true;
        } else {
            delete tabLoadedStates[tabId];
        }

    } else if (message.command === "is_tab_id_activated" && message.tabId) {
        let state = false;
        if (tabLoadedStates[message.tabId]) {
            state = true;
        }
        sendResponse({ state: state });
    }
});

browser.tabs.onRemoved.addListener((tabId) => {
    delete tabLoadedStates[tabId];
});
