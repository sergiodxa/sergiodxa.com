export default {
	header: { title: "Sergio Xalambrí" },

	nav: {
		home: "Inicio",
		articles: "Artículos",
		bookmarks: "Bookmarks",
		sponsor: "Apoyame en GitHub",
		logout: "Cerrar sesión",
	},

	home: {
		latestNotes: {
			title: "Articulos recientes",
			description: "Estos son mis ultimos artículos",
			footer:
				"¿Querés leerlos todos? <link:articles>Andá a la lista completa de artículos</link:articles>",
		},
		bookmarks: {
			title: "Bookmarks recientes",
			description: "Los últimos links que me guardé",
		},
	},

	articles: {
		404: "404 No encontrado",
		empty:
			"La URL /articles?page={{page}} no se pudo encontrar en el servidor.",
		title: "Artículos",
		meta: {
			title: {
				default: "Artículos de sergiodxa",
				search:
					"Resultados de búsqueda para '{{term}}' en el blog de sergiodxa",
			},
		},
		description: {
			search:
				"Mostrando {{count}} artículos para la búsqueda <highlight>{{term}}</highlight>",
			default: "Estos son mis artículos.",
		},
		search: {
			title: "Buscador",
			placeholder: "Remix, SWR, Next, Rails…",
			button: {
				progress: "Buscando…",
				default: "Buscar",
			},
		},
		nav: {
			prev: "Artículos anteriores",
			next: "Siguientes artículos",
		},
	},

	article: { meta: { title: "{{note}} por sergiodxa" } },

	bookmarks: {
		meta: { title: "Bookmarks de sergiodxa" },
		title: "Bookmarks",
	},
};
