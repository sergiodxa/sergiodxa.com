export default {
	header: { title: "Sergio Xalambrí" },

	nav: {
		home: "Home",
		articles: "Articles",
		bookmarks: "Bookmarks",
		tutorials: "Tutorials",
		glossary: "Glossary",
		cms: "Dashboard",
		sponsor: "Sponsor me on GitHub",
		login: "Access",
		logout: "Sign Out",
	},

	home: {
		meta: {
			title: {
				default: "Sergio Xalambrí",
				search: 'Search results for "{{query}}" by Sergio Xalambrí',
			},
		},

		header: {
			title: "Sergio Xalambrí",
			description:
				"Web Developer from Buenos Aires with 10+ years of experience. I work at <strong>Daffy</strong> and maintain several open-source libraries around React Router and OAuth2.",
		},

		subscribe: {
			cta: "Subscribe to my content using <rss>RSS</rss>.",
		},

		search: {
			label: "Search",
			placeholder: "Remix, SWR, Next, Rails…",
			button: {
				progress: "Searching…",
				default: "Search",
			},
		},

		feed: {
			title: "Activity",
			description: "My latests activity",

			article: "I wrote about <link:article>{{title}}</link:article>",

			tutorial: "I published how to <link:tutorial>{{title}}</link:tutorial>",

			bookmark: "I saved <link:bookmark>{{title}}</link:bookmark>",

			glossary:
				"I added the definition of <link:glossary>{{title}}</link:glossary> to the glossary",
		},
	},

	articles: {
		title: "Articles",

		meta: {
			title: "Articles of sergiodxa",
		},

		header: {
			title: "Articles",
			description: "These are my articles.",
		},

		subscribe: {
			cta: "Subscribe to my articles using <rss>RSS</rss>.",
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

		subscribe: {
			cta: "Subscribe to my bookmarks using <rss>RSS</rss>.",
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
		meta: {
			title: {
				default: "Tutorials by sergiodxa",
				search: "Tutorials about {{query}} by sergiodxa",
			},
		},

		header: {
			title: "Tutorials",
			description: "Learn about Remix, React, and more.",
		},

		search: {
			label: "Search tutorials",
			placeholder: "Remix, React, Next…",
			button: {
				progress: "Searching…",
				default: "Search",
			},
		},

		subscribe: {
			cta: "Subscribe to my tutorials using <rss>RSS</rss>.",
		},

		pagination: {
			first: "Newest",
			prev: "Newer",
			next: "Older",
			last: "Oldest",
		},
	},

	glossary: {
		title: "Glossary",

		header: {
			title: "Glossary",
			description: "My definition of some terms.",
		},
	},

	tutorial: {
		document: {
			title: "How to {{title}} by sergiodxa",
		},
		header: {
			eyebrown: "How to",
			edit: "Edit Tutorial",
		},
		tags: "Used",
		related: {
			title: "Related tutorials",
			reason: "Because both uses <anchor>{{tag}}</anchor>",
		},
	},

	support: {
		title: "Do you like my content?",
		cta: "Sponsor me on GitHub",
	},

	notFound: {
		title: "404 Not Found",
	},

	error: {
		NOT_FOUND: "404 Not Found",
		NOTE_NOT_FOUND: "The article {{path}} was not found",
	},

	write: {
		title: "Write something new",
	},

	editor: {
		button: {
			bold: "Bold",
			italic: "Italic",
			link: "Link",
			code: "Code",
			quote: "Quote",
			image: "Image",
			heading: "Heading",
		},
	},

	cms: {
		layout: {
			nav: {
				label: "Dashboard",
				items: {
					dashboard: "Dashboard",
					articles: "Articles",
					likes: "Likes",
					tutorials: "Tutorials",
					glossary: "Glossary",
					cache: "Cache Keys",
					redirects: "Redirects",
				},
			},
		},

		_index: {
			stats: {
				title: "Post Stats",
				total: {
					articles: "Total Articles",
					likes: "Total Likes",
					tutorials: "Total Tutorials",
					glossary: "Total Glossary Terms",
				},
				viewAll: "View all",
			},

			quickAction: {
				like: {
					title: "Quick Action: Like a URL",
					label: "URL",
					cta: "Create Like",
				},
			},

			lastDaySearch: {
				title: "Search Terms: Last 24hs",
			},
		},

		users: {
			search: { label: "What're you looking for?", cta: "Search" },
			table: {
				header: {
					name: "Name",
					role: "Role",
					email: "Email",
					createdAt: "Date Created",
					updatedAt: "Last Update",
				},
			},
		},

		likes: {
			search: { label: "What're you looking for?", cta: "Search" },
			import: { cta: "Import Bookmarks" },
			list: {
				item: {
					publishedOn: "Published on {{date}}",
					edit: "Edit Like",
					delete: { cta: "Delete", pending: "Deleting" },
				},
			},
		},

		articles: {
			search: { label: "What're you looking for?", cta: "Search" },
			import: { cta: "Import Articles" },
			reset: { cta: "Reset Articles" },
			list: {
				item: {
					publishedOn: "Published on {{date}}",
					edit: "Edit Article",
					moveToTutorial: "Move to Tutorial",
				},
			},
		},

		tutorials: {
			search: { label: "What're you looking for?", cta: "Search" },
			import: { cta: "Import Tutorials" },
			reset: { cta: "Reset Tutorials" },
			list: {
				item: {
					publishedOn: "Published on {{date}}",
					edit: "Edit Tutorial",
					delete: { cta: "Delete", pending: "Deleting" },
				},
			},
		},
	},

	rss: {
		title: "Sergio Xalambrí",
		description:
			"The complete list of articles, bookmarks, tutorials, and glossary terms of @sergiodxa.",
		cta: "Read it on the web",

		tutorials: {
			title: "Tutorials by Sergio Xalambrí",
			description: "The complete list of tutorials wrote by @sergiodxa.",
			cta: "Read it on the web",
		},

		articles: {
			title: "Articles by Sergio Xalambrí",
			description: "The complete list of articles wrote by @sergiodxa.",
			cta: "Read it on the web",
		},

		bookmarks: {
			title: "Bookmarks by Sergio Xalambrí",
			description: "The complete list of bookmarks saved by @sergiodxa.",
			cta: "Read it on the web",
		},
	},
};
