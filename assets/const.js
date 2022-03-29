const owner = "384233645621248011";

const manager = [
    owner,
    "590430031281651722", // Traveler
    "546614210243854337", // Juxta
    "501782173364518912" // Raticate
];

const guilds = {
    test: "719132687897591808",
    furry: "669934356172636199",
    main: [
        "719132687897591808",
        "669934356172636199"
    ]
};

const channels = {
    subscribe_notification: "681543745824620570",
    subscribe_category: "696655511197712414",
    subscribe_overview: "675956755112394753",
    book: {
        subscriber: "672359094828531712",
        freeResource: "681895247466201203"
    },
};

const roles = {
    subscriber: "683592115942457360"
};

const emojis = {
    bookReaction: "076:713997954201157723",
    saveMessage: "🐍"
};

module.exports = {
    owner,
    manager,
    guilds,
    channels,
    roles,
    emojis
};