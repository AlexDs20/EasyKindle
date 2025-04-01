let browserApi;
if (chrome !== undefined) {
    browserApi = chrome;
} else {
    browserApi = browser;
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

browserApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "set_current_active_tab") {
        const tabId = sender.tab.id;

        browserApi.storage.local.get([ "tabLoadedStates" ]).then((tabLoadedStates) => {
            let updatedTabLoadedStates = tabLoadedStates.tabLoadedStates || {};
            if (message.state) {
                updatedTabLoadedStates[tabId] = true;
            } else {
                delete updatedTabLoadedStates[tabId];
            }
            browserApi.storage.local.set({"tabLoadedStates": updatedTabLoadedStates});
        })
        .catch(handleError);

    } else if (message.command === "is_tab_id_activated" && message.tabId) {
        browserApi.storage.local.get([ "tabLoadedStates" ]).then((tabLoadedStates) => {
            let state = false;
            if (tabLoadedStates && tabLoadedStates.tabLoadedStates && tabLoadedStates.tabLoadedStates[message.tabId]) {
                state = true;
            }
            sendResponse({ state: state });
        })
        .catch(handleError);
        return true;
    }
});
