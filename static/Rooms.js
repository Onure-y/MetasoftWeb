class Rooms {
    constructor() {
        this.rooms = {};
    }

    modifyRoom (roomName, roomData) {
        this.rooms[roomName] = roomData;
    }

    get length() {
        return Object.keys(this.rooms).length;
    }

    getRooms() {
        return this.rooms;
    }

}