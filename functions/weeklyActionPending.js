// Derived delivery index, never an authority for points or admission time.
const pendingRef = (db, sourcePath) => db.doc(`weeklyActionPending/${Buffer.from(sourcePath).toString('base64url')}`);
module.exports = { pendingRef };
