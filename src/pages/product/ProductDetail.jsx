import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EXCHANGE_RATE = 4100;

export default function MedicineDetail() {
  const { id } = useParams(); // medicine id
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Backend endpoint for a single medicine (see step 4)
        const res = await axios.get(
          `http://127.0.0.1:8000/api/client/medicines/${id}`
        );
        setMedicine(res.data.data ?? res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!medicine) return <div className="p-6">Not found</div>;

  const usd = medicine.price ?? 0;
  const khr = usd * EXCHANGE_RATE;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="mb-4 underline">
        ← Back
      </button>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <img
          src={medicine.image || "https://via.placeholder.com/600x400"}
          alt={medicine.medicine_name}
          className="w-full h-64 object-cover rounded mb-4"
        />
        <h1 className="text-2xl font-bold">{medicine.medicine_name}</h1>
        <p className="mt-1 text-sm opacity-80">
          Barcode: {medicine.barcode || "—"}
        </p>
        <p className="mt-1">Weight: {medicine.weight || "—"}</p>
        <p className="mt-2 text-lg">
          Price: ${usd.toFixed(2)} | ៛{khr.toLocaleString()}
        </p>
        {medicine.units?.length ? (
          <p className="mt-2">
            Units: {medicine.units.map((u) => u.unit_name).join(", ")}
          </p>
        ) : null}
        {medicine.categories?.length ? (
          <p className="mt-1">
            Categories:{" "}
            {medicine.categories.map((c) => c.category_name).join(", ")}
          </p>
        ) : null}
        {medicine.medicine_detail ? (
          <p className="mt-3 text-sm">{medicine.medicine_detail}</p>
        ) : null}
      </div>
    </div>
  );
}
