"use client";
import { useState } from "react";

export default function ShippingCalculator() {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold text-gray-700">Calcular Frete</h3>
      <p className="text-sm text-gray-500">Digite seu CEP no checkout para ver o valor.</p>
    </div>
  );
}