// backend/src/controllers/vehicleController.js
// Vehicle controllers (uses vehicleModel with bulk insert support)

const vehicleModel = require('../models/vehicleModel');

/**
 * POST /api/vehicles
 * Accepts either a single vehicle object or an array of vehicles for bulk insertion.
 */
async function createVehicleHandler(req, res) {
  try {
    const data = req.body;

    // If client sent an array -> bulk insert
    if (Array.isArray(data)) {
      if (data.length === 0) return res.status(400).json({ error: 'empty array' });

      try {
        const result = await vehicleModel.createVehiclesBulk(data);
        return res.status(201).json({
          message: 'vehicles_bulk_created',
          insertedCount: result.insertedCount,
          firstInsertId: result.firstInsertId
        });
      } catch (err) {
        console.error('bulk create error', err);
        return res.status(500).json({ error: 'internal_server_error', detail: err.message });
      }
    }

    // otherwise single object handling
    if (!data || !data.owner_id || !data.vehicle_type) {
      return res.status(400).json({ error: 'owner_id and vehicle_type required' });
    }

    const result = await vehicleModel.createVehicle(data);
    return res.status(201).json({ id: result.id, message: 'vehicle_created' });
  } catch (err) {
    console.error('createVehicle error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

// rest of handlers unchanged — keep your implementations for get/update etc.
async function getVehicleHandler(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const vehicle = await vehicleModel.getVehicleById(id);
    if (!vehicle) return res.status(404).json({ error: 'not_found' });
    return res.json({ vehicle });
  } catch (err) {
    console.error('getVehicle error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

async function listVehiclesByOwnerHandler(req, res) {
  try {
    const ownerId = Number(req.params.ownerId);
    const onlyAvailable = req.query.available === '1' || req.query.available === 'true';
    if (!ownerId) return res.status(400).json({ error: 'invalid owner id' });
    const list = await vehicleModel.getVehiclesByOwner(ownerId, onlyAvailable);
    return res.json({ vehicles: list });
  } catch (err) {
    console.error('listVehiclesByOwner error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

async function updateVehicleHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const fields = req.body;
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const ok = await vehicleModel.updateVehicle(id, fields);
    if (!ok) return res.status(404).json({ error: 'not_found_or_no_changes' });
    return res.json({ message: 'updated' });
  } catch (err) {
    console.error('updateVehicle error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

async function addPhotoHandler(req, res) {
  try {
    const vehicleId = Number(req.params.id);
    const photo = req.body;
    if (!vehicleId || !photo || !photo.photo_url) return res.status(400).json({ error: 'vehicle id and photo_url required' });
    const result = await vehicleModel.addVehiclePhoto(vehicleId, photo);
    return res.status(201).json({ id: result.id, message: 'photo_added' });
  } catch (err) {
    console.error('addPhoto error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

async function removePhotoHandler(req, res) {
  try {
    const photoId = Number(req.params.photoId);
    if (!photoId) return res.status(400).json({ error: 'invalid photo id' });
    const ok = await vehicleModel.removeVehiclePhoto(photoId);
    if (!ok) return res.status(404).json({ error: 'not_found' });
    return res.json({ message: 'deleted' });
  } catch (err) {
    console.error('removePhoto error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

async function setAvailabilityHandler(req, res) {
  try {
    const vehicleId = Number(req.params.id);
    const available = req.body.available;
    if (!vehicleId || typeof available !== 'boolean') return res.status(400).json({ error: 'invalid input' });
    const ok = await vehicleModel.setAvailability(vehicleId, available);
    if (!ok) return res.status(404).json({ error: 'not_found' });
    return res.json({ message: 'availability_updated' });
  } catch (err) {
    console.error('setAvailability error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

// GET /api/vehicles -> uses model.getAllVehicles(filters)

async function getAllVehiclesHandler(req, res) {
  try {
    // Pull query params (city, type, available)
    const { city, type, available } = req.query;

    const filters = {};
    if (city) filters.city = city;
    if (type) filters.type = type;
    if (typeof available !== 'undefined') {
      // allow ?available=1 or ?available=true
      filters.available = available === '1' || available === 'true';
    }

    const list = await vehicleModel.getAllVehicles(filters);
    return res.json(list); // returns array
  } catch (err) {
    console.error('getAllVehicles error', err);
    return res.status(500).json({ error: 'internal_server_error', detail: err.message });
  }
}

module.exports = {
  createVehicleHandler,
  getVehicleHandler,
  listVehiclesByOwnerHandler,
  updateVehicleHandler,
  addPhotoHandler,
  removePhotoHandler,
  setAvailabilityHandler,
  getAllVehiclesHandler
};
