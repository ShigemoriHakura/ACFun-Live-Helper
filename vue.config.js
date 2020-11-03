module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      webSecurity: false
    }
  }
}