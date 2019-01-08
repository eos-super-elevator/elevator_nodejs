const building = {
    "floor_height": 4,
    "floors": [
        {
            "id": 0,
            "restricted_area": false
        },
        {
            "id": 1,
            "restricted_area": false
        },
        {
            "id": 2,
            "restricted_area": false
        },
        {
            "id": 3,
            "restricted_area": false
        },
        {
            "id": 4,
            "restricted_area": false
        },
        {
            "id": 5,
            "restricted_area": false
        },
        {
            "id": 6,
            "restricted_area": false
        },
        {
            "id": 7,
            "restricted_area": false
        },
        {
            "id": 8,
            "restricted_area": false
        },
        {
            "id": 9,
            "restricted_area": false
        }
    ],
    existsFloor: (floor) => {
        return (floor >= 0 && floor <= building.floors.length);
    },
    getMaxFloor: () => {
        return building.floors.length;
    }
};

export default building;