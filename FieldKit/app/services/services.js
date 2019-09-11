class Services {
    DiscoverStation() {
        if (!this.discoverStation) {
            const DiscoverStation = require("./discover-station").default;
            this.discoverStation = new DiscoverStation();
        }
        return this.discoverStation;
    }

    Database() {
        if (!this.database) {
            const DatabaseInterface = require("./db-interface").default;
            this.database = new DatabaseInterface();
        }
        return this.database;
    }

    QueryStation() {
        if (!this.queryStation) {
            const QueryStation = require("./query-station").default;
            this.queryStation = new QueryStation();
        }
        return this.queryStation;
    }

    StateManager() {
        if (!this.stateManager) {
            const StateManager = require("./state-manager").default;
            this.stateManager = new StateManager(this.Database(), this.QueryStation(), this.StationMonitor(), this.PortalInterface(), this.ProgressService());
        }
        return this.stateManager;
    }

    StationMonitor() {
        if (!this.stationMonitor) {
            const StationMonitor = require("./station-monitor").default;
            this.stationMonitor = new StationMonitor(this.DiscoverStation(), this.Database(), this.QueryStation());
        }
        return this.stationMonitor;
    }

    CreateDb() {
        if (!this.createDb) {
            const CreateDb = require("./create-db").default;
            this.createDb = new CreateDb(this.Database());
        }
        return this.createDb;
    }

    PortalInterface() {
        if (!this.portalInterface) {
            const PortalInterface = require("./portal-interface").default;
            this.portalInterface = new PortalInterface();
        }
        return this.portalInterface;
    }

    ProgressService() {
        if (!this.progressService) {
            const ProgressService = require("./progress-service").default;
            this.progressService = new ProgressService();
        }
        return this.progressService;
    }
}

const services = new Services();

export default services;
