import { Tab } from './tab';

import {
    handleActivated,
    handleCreated,
    handleRemoved,
    handleReplaced,
} from './listeners/tabListener';

import {
    handleBeforeRequest,
    handleBeforeSendHeaders,
    handleHeadersReceived,
} from './listeners/webRequestListener';

import {
    handleChangedCookies,
} from './listeners/cookiesListener';

import {
    handleReceivedMessage,
} from './listeners/messageListener';

import * as voprf from './voprf';

/* Initialize shared modules */

voprf.initECSettings(voprf.defaultECSettings);

/* Local state */

declare global {
    interface Window {
        ACTIVE_TAB_ID: number;
        TABS: Map<number, Tab>;
    }
}

window.ACTIVE_TAB_ID = chrome.tabs.TAB_ID_NONE;
window.TABS = new Map<number, Tab>();

/* Access to local state */

export function forceUpdateIcon(): void {
    const activeTab = window.TABS.get(window.ACTIVE_TAB_ID);
    if (activeTab !== undefined) {
        activeTab.forceUpdateIcon();
    }
}

/* Listeners for navigator */

chrome.tabs.onActivated.addListener(handleActivated);

chrome.tabs.onCreated.addListener(handleCreated);

chrome.tabs.onReplaced.addListener(handleReplaced);

chrome.tabs.onRemoved.addListener(handleRemoved);

// Loads all the existings tabs.
chrome.tabs.query({}, function (existingTabs: chrome.tabs.Tab[]) {
    existingTabs.forEach((tab) => {
        if (tab.id === undefined) {
            throw new Error('tab undefined');
        }
        window.TABS.set(tab.id, new Tab(tab.id));
    });
});

// Finds which tab is currently active.
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs: chrome.tabs.Tab[]) {
    const [tab] = tabs;
    if (tab !== undefined && tab.id !== undefined) {
        window.ACTIVE_TAB_ID = tab.id;
    }
});

chrome.webRequest.onBeforeRequest.addListener(handleBeforeRequest, { urls: ['<all_urls>'] }, [
    'requestBody',
    'blocking',
]);

chrome.webRequest.onBeforeSendHeaders.addListener(
    handleBeforeSendHeaders,
    { urls: ['<all_urls>'] },
    ['requestHeaders', 'blocking'],
);

chrome.webRequest.onHeadersReceived.addListener(handleHeadersReceived, { urls: ['<all_urls>'] }, [
    'responseHeaders',
    'blocking',
]);

chrome.cookies.onChanged.addListener(handleChangedCookies);

chrome.runtime.onMessage.addListener(handleReceivedMessage);
