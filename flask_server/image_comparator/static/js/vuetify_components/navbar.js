var Navbar = new Vue({
	el: '#navbar',
	vuetify: new Vuetify(),
	delimiters: ['[[',']]'],
	data() {
	  return {
		message: "navbar_message",
	  }
	},
})