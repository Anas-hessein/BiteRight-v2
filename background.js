console.log("BiteRight background script loaded");


const DEFAULT_SETTINGS = {
    globalLimit: 6,
    roastStyle: "funny",
    hardLimitMode: false,
    stats: { 
        totalTabsOpened: 0, 
        roastsGiven: 0, 
        siteCounts: {} 
    }
};


chrome.runtime.onInstalled.addListener(async () => {
    console.log("BiteRight extension installed");
    

    const existing = await chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS));
    const toSet = {};
    
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (existing[key] === undefined) {
            toSet[key] = value;
        }
    }
    
    if (Object.keys(toSet).length > 0) {
        await chrome.storage.local.set(toSet);
        console.log("Set default settings:", toSet);
    }
});

chrome.tabs.onCreated.addListener(async (tab) => {
    try {

        const data = await chrome.storage.local.get([
            "globalLimit", 
            "roastStyle", 
            "hardLimitMode", 
            "stats"
        ]);
        
        const limit = data.globalLimit || DEFAULT_SETTINGS.globalLimit;
        const roastStyle = data.roastStyle || DEFAULT_SETTINGS.roastStyle;
        const hardLimit = data.hardLimitMode || DEFAULT_SETTINGS.hardLimitMode;
        let stats = data.stats || DEFAULT_SETTINGS.stats;
        

        const allTabs = await chrome.tabs.query({});
        

        stats.totalTabsOpened = (stats.totalTabsOpened || 0) + 1;
        if (tab.pendingUrl || tab.url) {
            const url = tab.pendingUrl || tab.url;
            try {
                const domain = new URL(url).hostname;
                stats.siteCounts[domain] = (stats.siteCounts[domain] || 0) + 1;
            } catch (e) {

            }
        }
        

        if (allTabs.length > limit) {
            stats.roastsGiven = (stats.roastsGiven || 0) + 1;
            

            try {
                await chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon128.png",
                    title: "Too Many Tabs Open!",
                    message: getRandomRoast(roastStyle),
                    priority: 2
                });
            } catch (error) {
                console.log("Notification error:", error);
            }
            

            if (hardLimit && tab.id) {
                try {
                    await chrome.tabs.remove(tab.id);
                    console.log(`Closed tab ${tab.id} due to hard limit`);
                } catch (error) {
                    console.log("Error closing tab:", error);
                }
            }
        }
        

        await chrome.storage.local.set({ stats });
        
    } catch (error) {
        console.error("Error in tab creation handler:", error);
    }
});

function getRandomRoast(style) {
    const ROASTS = {
        funny: [
            "🤡 Wow, you really need THAT many tabs open? Are you collecting them like Pokémon cards?",
            "🎪 Welcome to the Tab Circus! You're the star of this chaotic show!",
            "🍕 You have more tabs than a pizza has slices... and that's saying something!",
            "🐙 Are you part octopus? Because you're handling more tabs than tentacles!",
            "📚 Your browser looks like a digital library explosion happened!",
            "🚗 You have more tabs open than a taxi has doors!",
            "🎯 Achievement unlocked: Tab Hoarder Supreme!"
        ],
        sarcastic: [
            "😏 Oh sure, you DEFINITELY need 47 tabs open for 'research'...",
            "🙄 Let me guess, you're 'definitely going to read all of those later'?",
            "😤 Nothing screams 'I'm organized' like having more tabs than brain cells!",
            "💀 Your RAM is crying. Literally. I can hear it sobbing.",
            "🎭 Congrats! You've turned your browser into a digital museum of procrastination!",
            "⚰️ RIP to your computer's performance. It died doing what it loved: suffering.",
            "🤷 Why use bookmarks when you can just keep everything open forever, right?"
        ],
        motivational: [
            "💪 Time to declutter and focus! Close some tabs and boost your productivity!",
            "🌟 You've got this! A clean browser leads to a clear mind!",
            "🎯 Focus your energy! Close the tabs you don't need and concentrate on what matters!",
            "🚀 Ready for takeoff? Close those extra tabs and launch into productivity!",
            "🧘 Digital minimalism leads to mental clarity. You can do this!",
            "⚡ Channel your inner organization guru and tame those tabs!",
            "🏆 Every closed tab is a step toward digital wellness!"
        ]
    };

    const arr = ROASTS[style] || ROASTS.funny;
    return arr[Math.floor(Math.random() * arr.length)] || "🤔 Hmm, maybe close a few tabs?";
}


chrome.notifications.onClicked.addListener(async (notificationId) => {
    try {
        const data = await chrome.storage.local.get(["globalLimit"]);
        const limit = data.globalLimit || DEFAULT_SETTINGS.globalLimit;
        const tabs = await chrome.tabs.query({});
        
        if (tabs.length > limit) {

            const activeTab = await chrome.tabs.query({ active: true, currentWindow: true });
            const tabsToClose = tabs.filter(tab => !activeTab.find(active => active.id === tab.id));
            
            if (tabsToClose.length > 0) {
                await chrome.tabs.remove(tabsToClose[0].id);
                console.log("Closed tab via notification click");
            }
        }
        

        chrome.notifications.clear(notificationId);
    } catch (error) {
        console.error("Error handling notification click:", error);
    }
});
