// v2.1.0 security cleanup: real customer master is no longer embedded in the public static bundle.
// Existing device-local data remains in localStorage; shared customer data will move to Firestore in the next stage.
window.HOKUYOU_IMPORTED_CUSTOMERS=[];
