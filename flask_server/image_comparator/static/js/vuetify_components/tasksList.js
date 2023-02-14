const { required, maxLength } = validators
const validationMixin = vuelidate.validationMixin

Vue.use(vuelidate.default)

var tasksList = new Vue({
    el: '#tasksList',
    vuetify: new Vuetify(),
    mixins: [validationMixin],

    validations: {
        user: { required, maxLength: maxLength(10) },
        imageListName: { required },
        imageListTypeSelect: { required },
        taskOrder: { required },
    },

    data: () => ({
        // Left Column - Tasks Display
        message: 'This is a template app',
        classifyTasks: [],
        compareTasks: [],
        alert_message: null,
        // Right Column - Create Task
        user: '',
        imageListName: '',
        imageListTypeSelect: null,
        imageListTypeSelectItems: ['compare', 'classify', 'grid'],
        taskOrder: '',
    }),

    async mounted() {
        configuration = await this.getConfiguration()
        this.DNS = configuration.DNS;
        this.IMAGES_DB = configuration.IMAGES_DB;
        this.DB_PORT = configuration.DB_PORT;
        this.HTTP_PORT = configuration.HTTP_PORT;
        this.ADMIN_PARTY = configuration.ADMIN_PARTY;
        this.USER_INFO = configuration.USER_INFO;
        this.getTasks();
    },

    computed: {
        // General
        URLS() {
            return {
                configuration: "/configuration",
                getBase: `http://${this.DNS}:${this.HTTP_PORT}`,
                getCompareTasks: `http://${this.DNS}:${this.HTTP_PORT}/get_tasks/compare?username=${this.USER_INFO.username}`,
                getClassifyTasks: `http://${this.DNS}:${this.HTTP_PORT}/get_tasks/classify?username=${this.USER_INFO.username}`,
                goToImageSummary: `http://${this.DNS}:${this.HTTP_PORT}/image_list_summary`,
                getImageCompareListNames: `http://${this.DNS}:${this.HTTP_PORT}/get_image_compare_lists`,
                getImageClassifyListNames: `http://${this.DNS}:${this.HTTP_PORT}/get_image_classify_lists`,
                getImageGridListNames: `http://${this.DNS}:${this.HTTP_PORT}/get_image_grid_lists`,
                getImagePairListNames: `http://${this.DNS}:${this.HTTP_PORT}/get_image_pair_lists`
            }
        },
        // Right Column
        userErrors() {
            const errors = []
            if (!this.$v.user.$dirty) return errors
            !this.$v.user.maxLength && errors.push('User must be at most 10 characters long')
            !this.$v.user.required && errors.push('User is required.')
            return errors
        },
        imageListNameErrors() {
            const errors = []
            if (!this.$v.imageListName.$dirty) return errors
            !this.$v.imageListName.required && errors.push('User is required.')
            return errors
        },
        imageListTypeSelectErrors() {
            const errors = []
            if (!this.$v.imageListTypeSelect.$dirty) return errors
            !this.$v.imageListTypeSelect.required && errors.push('List Type is required.')
            return errors
        },
        taskOrderErrors() {
            const errors = []
            if (!this.$v.taskOrder.$dirty) return errors
            !this.$v.taskOrder.required && errors.push('User is required.')
            return errors
        },
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

        getTasks() {
            console.log("getTasks")
            fetch(this.URLS.getClassifyTasks)
                .then((response) => response.json())
                .then((data) => {
                    data.rows.forEach((v, i, a) => {
                        //debugger
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
        },
        goToImageSummary(imageList) {
            console.log("goToImageSummary")
            debugger
            if (imageList != null){
                window.location.replace(this.URLS.goToImageSummary + `/${imageList}`)
            }else {
                this.alert_message = "No Image List Associated"
                setTimeout(()=>{this.alert_message = null}, 2000)
            }
          },
        goToApp(task) {
          debugger
          console.log(`goToApp(${task.value.user}, ${task.value.list_name})`)
          window.location.replace(this.URLS.getBase + `/${task.value.app}App/${task.value.user}/${task.value.list_name}`)
        },
        // Right Column
        submit() {
            this.$v.$touch()
            //debugger
            this.$refs.form.$el.submit()
        },
        clear() {
            this.$v.$reset()
            this.user = ''
            this.imageListName = ''
            this.imageListTypeSelect = ''
            this.taskOrder = ''
        },

    },

    delimiters: ['[[', ']]'],
})