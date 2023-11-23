
var main_dashboard = new Vue({
    el: '#main_dashboard',
    vuetify: new Vuetify(),
    delimiters: ['[[', ']]'],

    data: () => ({
        DNS: null,
        IMAGES_DB: null,
        DB_PORT: null,
        HTTP_PORT: null,
        ADMIN_PARTY: null,
        USER_INFO: {admin:null, username:null, logged_in:null},
        message: '',
        classifyImageLists: [],
        compareImageLists: [],
        flickerImageLists: [],
        classifyTasks: [],
        compareTasks: [],
        flickerTasks: [],
        tasks: []
    }),

    async mounted() {
        configuration = await this.getConfiguration()
        this.DNS = configuration.DNS;
        this.SSL = configuration.SSL;
        this.IMAGES_DB = configuration.IMAGES_DB;
        this.DB_PORT = configuration.DB_PORT;
        this.HTTP_PORT = configuration.HTTP_PORT;
        this.ADMIN_PARTY = configuration.ADMIN_PARTY;
        this.USER_INFO = configuration.USER_INFO;
        this.getImageLists();
        this.getTasks();
    },

    computed: {
        URLS() {
            return {
                configuration: "/configuration",
                // old: ${this.SSL===true ? 'https' : 'http'}://${this.DNS}:${this.HTTP_PORT}
                getClassifyLists: `/get_image_classify_lists`,
                getCompareLists: `/get_image_compare_lists`,
                getFlickerLists: `/get_image_flicker_lists`,
                getClassifyTasks: `/get_tasks/classify?username=${this.USER_INFO.username}`,
                getCompareTasks: `/get_tasks/compare?username=${this.USER_INFO.username}`,
                getFlickerTasks: `/get_tasks/flicker?username=${this.USER_INFO.username}`
            }
        }
    },
    methods: {
        async getConfiguration() {
            // https://dmitripavlutin.com/javascript-fetch-async-await/
            const response = await fetch('/configuration');
            if (!response.ok) {
                const message = `An error has occured: ${response.status}`;
                throw new Error(message);
            }
            const configuration = await response.json();
            return configuration;
        },

        getImageLists() {
            console.log("getImageLists")
            fetch(this.URLS.getClassifyLists)
                .then((response) => response.json())
                .then((data) => {
                    data.rows.forEach((v, i, a) => {
                        this.classifyImageLists.push(v)
                    })
                })
            fetch(this.URLS.getCompareLists)
                .then((response) => response.json())
                .then((data) => {
                    data.rows.forEach((v, i, a) => {
                        this.compareImageLists.push(v)
                    })
                })
            fetch(this.URLS.getFlickerLists)
                .then((response) => response.json())
                .then((data) => {
                    data.rows.forEach((v, i, a) => {
                        this.flickerImageLists.push(v)
                    })
                })
        },

        getTasks() {
            console.log("getTasks")
            fetch(this.URLS.getClassifyTasks)
                .then((response) => response.json())
                .then((data) => {
                    data.rows.forEach((v, i, a) => {
                        this.classifyTasks.push(v)
                    })
                })
            fetch(this.URLS.getCompareTasks)
                .then((response) => response.json())
                .then((data) => {
                    data.rows.forEach((v, i, a) => {
                        this.compareTasks.push(v)
                    })
                })
            fetch(this.URLS.getFlickerTasks)
                .then((response) => response.json())
                .then((data) => {
                    data.rows.forEach((v, i, a) => {
                        this.flickerTasks.push(v)
                    })
                })
        },
    }

})