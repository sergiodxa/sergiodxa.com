export default {
	header: { title: "Sergio Xalambrí" },

	nav: {
		home: "Home",
		articles: "Essays",
		bookmarks: "Bookmarks",
		tutorials: "Tutorials",
		sponsor: "Sponsor me on GitHub",
		login: "Access",
		logout: "Sign Out",
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
		header: {
			title: "Articles",
			description: "These are my articles.",
		},
		description: {
			search:
				"Showing {{count}} articles for the query <highlight>{{term}}</highlight>",
			default: "These are my articles.",
		},
		search: {
			label: "Search",
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

		header: {
			title: "Bookmarks",
			description: "Links that I read and liked.",
		},
	},

	login: {
		title: "Access to your account",
		github: "Continue with GitHub",
		error: {
			title: "There is a problem",
			description: "There was an error trying to login with GitHub",
		},
	},

	logout: {
		title: "Are you sure you want to sign out?",
		cta: "Sign Out",
	},

	tutorials: {
		title: "Tutorials",
		description: "Learn about Remix, React, and more.",
		search: {
			label: "Search tutorials",
			placeholder: "Remix, React, Next…",
		},
	},

	error: {
		NOT_FOUND: "404 Not Found",
		NOTE_NOT_FOUND: "The article {{path}} was not found",
	},
};
