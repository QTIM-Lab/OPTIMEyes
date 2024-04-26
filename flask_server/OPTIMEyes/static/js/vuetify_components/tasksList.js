const { required, maxLength } = validators
const validationMixin = vuelidate.validationMixin

Vue.use(vuelidate.default)

var tasksList = new Vue({
    el: '#tasksList',
    vuetify: new Vuetify(),
    mixins: [validationMixin],

    validations: {
        user: { required, maxLength: maxLength(15) },
        imageSetName: { required },
        imageListTypeSelect: { required },
        taskOrder: { required },
    },

    data: () => ({
        // Left Column - Tasks Display
        message: 'This is a template app',
        classifyTasks: [],
        compareTasks: [],
        flickerTasks: [],
        sliderTasks: [],
        monaiSegmentationTasks: [],
        alert_warning: null,
        alert_success: null,
        alert_error: null,
        // Right Column - Create Task
        admin: false,
        user: '',
        imageSetName: '',
        imageListTypeSelect: null,
        imageListTypeSelectItems: ['classify', 'compare', 'flicker', 'slider', 'monaiSegmentation'],
        taskOrder: '',
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
        this.admin = this.USER_INFO.admin
        this.getTasks();
    },

    computed: {
        // General
        URLS() {
            return {
                configuration: "/configuration",
                getBase: `${this.SSL===true ? 'https' : 'http'}://${this.DNS}:${this.HTTP_PORT}`,
                getClassifyTasks: `/get_tasks/classify?username=${this.USER_INFO.username}`,
                getCompareTasks: `/get_tasks/compare?username=${this.USER_INFO.username}`,
                getFlickerTasks: `/get_tasks/flicker?username=${this.USER_INFO.username}`,
                getSliderTasks: `/get_tasks/slider?username=${this.USER_INFO.username}`,
                getMonaiSegmentationTasks: `/get_tasks/monaiSegmentation?username=${this.USER_INFO.username}`,
                getMonaiSegmentationAnnotation: `/downloadAnnotations`,
                goToImageSummary: `/image_set_summary`,
                makeTask: `/make_task`,
            }
        },
        // Right Column "Create Task"
        userErrors() {
            const errors = []
            if (!this.$v.user.$dirty) return errors
            !this.$v.user.maxLength && errors.push('User must be at most 15 characters long')
            !this.$v.user.required && errors.push('User is required.')
            return errors
        },
        imageSetNameErrors() {
            const errors = []
            if (!this.$v.imageSetName.$dirty) return errors
            !this.$v.imageSetName.required && errors.push('Image Set Name required.')
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
            !this.$v.taskOrder.required && errors.push('Task Order is required.')
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
            fetch(this.URLS.getFlickerTasks)
                .then((response) => response.json())
                .then((data) => {
                    data.rows.forEach((v, i, a) => {
                        this.flickerTasks.push(v)
                    })
            })
            fetch(this.URLS.getSliderTasks)
                .then((response) => response.json())
                .then((data) => {
                    data.rows.forEach((v, i, a) => {
                        this.sliderTasks.push(v)
                    })
            })
            fetch(this.URLS.getMonaiSegmentationTasks)
                .then((response) => response.json())
                .then((data) => {
                    data.rows.forEach((v, i, a) => {
                        this.monaiSegmentationTasks.push(v)
                    })
            })
        },
        async downloadAnnotations(task_id){
            const response = await fetch(`${this.URLS.getMonaiSegmentationAnnotation}/monaiSegmentation/${task_id}`);
            if (!response.ok) {
                const message = `An error has occured: ${response.status}`;
                throw new Error(message);
            }
            debugger
            var blob = await response.blob();
            var url = URL.createObjectURL(blob);
            window.open(url);
            // debugger;
        },
        goToImageSummary(imageList) {
            console.log("goToImageSummary")
            //debugger
            if (imageList != null){
                window.location.replace(this.URLS.goToImageSummary + `/${imageList}`)
            }else {
                this.alert_error = "No Image List Associated"
                setTimeout(()=>{this.alert_error = null}, 2000)
            }
        },
        goToApp(task) {
          console.log(`goToApp(${task.value.user}, ${task.value.list_name})`)
          debugger
          window.location.replace(`/${task.value.app}App/${task.value.user}/${task.value.list_name}`)
        },
        // Right Column
        submit() {
            // debugger
            var new_task = {}
            new_task['user'] = this.user
            new_task['imageSetName'] = this.imageSetName
            new_task['imageListTypeSelect'] = this.imageListTypeSelect
            new_task['taskOrder'] = this.taskOrder

            fetch(this.URLS.makeTask, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(new_task)
            })
            .then((response) => response.json())
            .then((data) => {
                console.log("back!")
                debugger
                response_message = JSON.parse(data);
                if (response_message === 'new_task_created'){
                    this.alert_success = "New task created."
                    setTimeout(()=>{this.alert_success = null}, 2000)
                }else{
                    this.alert_warning = "This task exists already."
                    setTimeout(()=>{this.alert_warning = null}, 2000)
                }

            })
        },
        clear() {
            this.$v.$reset()
            this.user = ''
            this.imageSetName = ''
            this.imageListTypeSelect = ''
            this.taskOrder = ''
        },

    },

    delimiters: ['[[', ']]'],
})