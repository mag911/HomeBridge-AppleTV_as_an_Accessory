const Accessory = require("./accessory");

class SwitchAccessory extends Accessory {
    constructor(platform, config, device) {
        super(SwitchAccessory.Type, platform, config, device);

        this.configureServices = this.configureServices.bind(this);
        this.configureAccessoryInformationService = this.configureAccessoryInformationService.bind(this);
        this.configureSwitchService = this.configureSwitchService.bind(this);
        this.onNowPlaying = this.onNowPlaying.bind(this);

        this.configureServices();
    }

    configureServices() {
        this.configureAccessoryInformationService();
        this.configureSwitchService();
    };

    configureAccessoryInformationService() {
        this.platform.debug(`configuring ${this.type} accessory information service for accessory (${this.device.name} [${this.device.uid}]).`);

        try {
            this.accessory
                .getService(this.platform.api.hap.Service.AccessoryInformation)
                .setCharacteristic(this.platform.api.hap.Characteristic.Manufacturer, "Apple")
                .setCharacteristic(this.platform.api.hap.Characteristic.Model, "Apple TV")
                .setCharacteristic(this.platform.api.hap.Characteristic.SerialNumber, this.device.uid)
                .setCharacteristic(this.platform.api.hap.Characteristic.Name, this.config.name);

            this.platform.debug(`${this.type} accessory information service for accessory (${this.device.name} [${this.device.uid}]) configured.`);
        } catch (error) {
            this.platform.log(`${this.type} accessory information service for accessory (${this.device.name} [${this.device.uid}]) could not be configured.`);
            this.platform.log(error);
        }
    };

    configureSwitchService() {
        this.platform.debug(`configuring switch service for ${this.type} accessory (${this.device.name} [${this.device.uid}]).`);

        try {
            this.switchService = this.accessory.getService(this.platform.api.hap.Service.Switch);

            if (!this.switchService) {
                this.switchService = this.accessory.addService(
                    this.platform.api.hap.Service.Switch,
                    `${this.config.name} Switch`,
                    `${this.accessory.context.uid}_switch`
                );

                this.platform.debug(`configuring ${this.type} service for accessory (${this.device.name} [${this.device.uid}]).`);
            }

            !this.switchService.getCharacteristic(this.characteristics.State) && this.switchService.addCharacteristic(this.characteristics.State);
            !this.switchService.getCharacteristic(this.characteristics.Type) && this.switchService.addCharacteristic(this.characteristics.Type);
            !this.switchService.getCharacteristic(this.characteristics.Title) && this.switchService.addCharacteristic(this.characteristics.Title);
            !this.switchService.getCharacteristic(this.characteristics.Artist) && this.switchService.addCharacteristic(this.characteristics.Artist);
            !this.switchService.getCharacteristic(this.characteristics.Album) && this.switchService.addCharacteristic(this.characteristics.Album);
            !this.switchService.getCharacteristic(this.characteristics.Application) && this.switchService.addCharacteristic(this.characteristics.Application);
            !this.switchService.getCharacteristic(this.characteristics.ApplicationBundleId) && this.switchService.addCharacteristic(this.characteristics.ApplicationBundleId);
            !this.switchService.getCharacteristic(this.characteristics.ElapsedTime) && this.switchService.addCharacteristic(this.characteristics.ElapsedTime);
            !this.switchService.getCharacteristic(this.characteristics.Duration) && this.switchService.addCharacteristic(this.characteristics.Duration);
            !this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.Active) && this.switchService.addCharacteristic(this.platform.api.hap.Characteristic.Active);

            this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.On).on("set", super.onPower.bind(this));

            this.device.on("nowPlaying", this.onNowPlaying);

            this.service = this.switchService;

            this.platform.debug(`${this.type} service for accessory (${this.device.name} [${this.device.uid}]) configured.`);
        } catch (error) {
            this.platform.debug(`${this.type} service for accessory (${this.device.name} [${this.device.uid}]) could not be configured.`);
            this.platform.debug(error);
        }
    };

    onNowPlaying(message) {
        if (message && message.playbackState && message.playbackState.length > 1) {
            message.playbackState = message.playbackState[0].toUpperCase() + message.playbackState.substring(1).toLowerCase();
        }

        this.switchService.getCharacteristic(this.characteristics.State).updateValue(message && message.playbackState ? message.playbackState : "-");
        this.switchService.getCharacteristic(this.characteristics.Type).updateValue(message ? (message.album && message.artist ? "Music" : "Video") : "-");
        this.switchService.getCharacteristic(this.characteristics.Title).updateValue(message && message.title ? message.title : "-");
        this.switchService.getCharacteristic(this.characteristics.Artist).updateValue(message && message.artist ? message.artist : "-");
        this.switchService.getCharacteristic(this.characteristics.Album).updateValue(message && message.album ? message.album : "-");
        this.switchService.getCharacteristic(this.characteristics.Application).updateValue(message && message.appDisplayName ? message.appDisplayName : "-");
        this.switchService.getCharacteristic(this.characteristics.ApplicationBundleId).updateValue(message && message.appBundleIdentifier ? message.appBundleIdentifier : "-");
        this.switchService.getCharacteristic(this.characteristics.ElapsedTime).updateValue(message && message.elapsedTime > 0 ? Math.round(message.elapsedTime) : "-");
        this.switchService.getCharacteristic(this.characteristics.Duration).updateValue(message && message.duration > 0 ? Math.round(message.duration) : "-");
        this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(message && message.playbackState === "Playing");
    };
}

SwitchAccessory.Type = "switch";

module.exports = SwitchAccessory;
