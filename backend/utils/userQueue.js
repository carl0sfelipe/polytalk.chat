let waitingUsers = [];

function addUserToQueue(userId) {
    waitingUsers.push(userId);
}

function findPairForUser(userId) {
    const pair = waitingUsers.find(u => u !== userId);
    if (pair) {
        waitingUsers = waitingUsers.filter(u => u !== userId && u !== pair);
        return pair;
    }
    return null;
}

module.exports = { addUserToQueue, findPairForUser };
