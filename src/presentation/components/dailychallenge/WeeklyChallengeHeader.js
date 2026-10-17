import React from "react";
import { ChallengeIcon } from "../Icons";

const WeeklyChallengeHeader = ({ categoryStyle, calculateWeeklyProgress }) => (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <ChallengeIcon className={`h-6 w-6 ${categoryStyle.text} mr-2`} />
          <h3 className="text-xl font-bold text-white">
            Desafio Semanal
          </h3>
        </div>
        <div className="text-right">
          <div className={`text-xs ${categoryStyle.text}`}>
            {calculateWeeklyProgress.daysRemaining > 0 
              ? `${calculateWeeklyProgress.daysRemaining} dias restantes`
              : 'Último dia!'
            }
          </div>
          <div className={`w-20 ${categoryStyle.track} rounded-full h-2 mt-1`}>
            <div 
              className={`bg-gradient-to-r ${categoryStyle.bar} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${calculateWeeklyProgress.percentage}%` }}
            />
          </div>
        </div>
      </div>
);

export default WeeklyChallengeHeader;
