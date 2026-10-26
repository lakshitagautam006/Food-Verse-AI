import React from 'react';
import { ShieldCheckIcon } from './Icons';

export default function DisclaimerBanner({ moduleType }) {
  let contextText = "Estimates & visual observations only. Not intended for medical, laboratory, or regulatory safety certification.";

  if (moduleType === 'nutrition') {
    contextText = "Nutritional values are algorithmic estimates based on visual appearance. Actual caloric and macronutrient contents depend on recipes, cooking oils, and precise serving weights.";
  } else if (moduleType === 'freshness') {
    contextText = "Visual freshness observations cannot detect invisible foodborne pathogens (e.g. Salmonella, E. coli), bacterial toxins, or past temperature abuse. When in doubt, discard food.";
  } else if (moduleType === 'hygiene') {
    contextText = "Hygiene observations are based on user-submitted photos and do not represent an official regulatory health inspection or municipal code compliance certificate.";
  } else if (moduleType === 'meal-planner') {
    contextText = "Meal plans serve as educational nutrition guides. Always consult a physician or registered dietitian for specialized dietary or medical conditions.";
  }

  return (
    <div className="disclaimer-banner">
      <div className="disclaimer-icon">
        <ShieldCheckIcon className="w-5 h-5 text-emerald" />
      </div>
      <div className="disclaimer-body">
        <strong>Important Safety & AI Ethics Notice:</strong> {contextText}
      </div>
    </div>
  );
}
