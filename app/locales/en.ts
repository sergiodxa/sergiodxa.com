export default {
	header: { title: "Sergio Xalambrí" },

	nav: {
		home: "Home",
		articles: "Articles",
		bookmarks: "Bookmarks",
		sponsor: "Sponsor me on GitHub",
	},

	home: {
		latestNotes: {
			title: "Latest notes",
			description: "These are my latests articles",
			footer:
				"Want to read them all? <link:articles>Check the full article list</link:articles>",
		},
		bookmarks: {
			title: "Recent bookmarks",
			description: "The latests links I have bookmarked",
		},
	},

	articles: {
		404: "404 Not Found",
		empty:
			"The requested URL /articles?page={{page}} was not found on this server.",
		title: "Articles",
		meta: {
			title: {
				default: "Articles of sergiodxa",
				search: 'Search results for "{{term}}" on sergiodxa\' blog',
			},
		},
		description: {
			search:
				"Showing {{count}} articles for the query <highlight>{{term}}</highlight>",
			default: "These are my articles.",
		},
		search: {
			title: "Search",
			placeholder: "Remix, SWR, Next, Rails…",
			button: {
				progress: "Searching…",
				default: "Search",
			},
		},
		nav: {
			prev: "Previous articles",
			next: "Next articles",
		},
	},

	article: { meta: { title: "{{note}} by sergiodxa" } },

	bookmarks: {
		meta: { title: "Bookmarks of sergiodxa" },
		title: "Bookmarks",
	},
};
