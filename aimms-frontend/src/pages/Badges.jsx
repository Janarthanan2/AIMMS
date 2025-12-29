import React, { useEffect, useState } from 'react';
import { getGamificationStats, getAllBadges } from '../services/api';

export default function Badges() {
  const [stats, setStats] = useState(null);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      Promise.all([
        getGamificationStats(userId).catch(() => null),
        getAllBadges().catch(() => [])
      ]).then(([statsData, badgesData]) => {
        setStats(statsData || { points: 0, level: 'ROOKIE', earnedBadges: [], nextLevelPoints: 500 });
        setAllBadges(badgesData);
        setLoading(false);
      });
    }
  }, [userId]);

  const getLevelColor = (level) => {
    switch (level) {
      case 'PLATINUM': return 'bg-gradient-to-r from-slate-400 to-slate-100 border-slate-300 text-slate-800';
      case 'GOLD': return 'bg-gradient-to-r from-yellow-400 to-yellow-100 border-yellow-300 text-yellow-800';
      case 'SILVER': return 'bg-gradient-to-r from-gray-300 to-gray-100 border-gray-300 text-gray-800';
      case 'BRONZE': return 'bg-gradient-to-r from-orange-400 to-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-white border-gray-200 text-gray-600';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading rewards...</div>;

  const earnedIds = new Set(stats?.earnedBadges?.map(ub => ub.badge.badgeId));
  const progress = Math.min(100, (stats?.points / stats?.nextLevelPoints) * 100);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Rewards</h1>
          <p className="text-gray-500 mt-1">Earn badges and points for good financial habits!</p>
        </div>

        {/* Level Card */}
        <div className={`px-8 py-6 rounded-2xl shadow-lg border-2 ${getLevelColor(stats?.level)} flex items-center space-x-6 w-full md:w-auto transform hover:scale-105 transition-transform`}>
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-wider opacity-70">Current Level</div>
            <div className="text-4xl font-extrabold">{stats?.level}</div>
          </div>
          <div className="h-12 w-px bg-current opacity-20"></div>
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-wider opacity-70">Total Points</div>
            <div className="text-4xl font-extrabold">{stats?.points}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
          <span>Progress to Next Level</span>
          <span>{stats?.points} / {stats?.nextLevelPoints} XP</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Keep sticking to your budget to earn more points!
        </p>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-2">🏆</span> Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {allBadges.map(badge => {
            const isEarned = earnedIds.has(badge.badgeId);
            return (
              <div
                key={badge.badgeId}
                className={`relative group p-6 rounded-xl border-2 flex flex-col items-center text-center transition-all duration-300 
                                    ${isEarned
                    ? 'bg-white border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1'
                    : 'bg-gray-50 border-gray-100 opacity-60 grayscale hover:opacity-100'}`}
              >
                <div className={`text-5xl mb-4 transform transition-transform group-hover:scale-110 ${isEarned ? 'animate-bounce-short' : ''}`}>
                  {badge.code === 'BUDGET_MASTER' ? '🎯' :
                    badge.code === 'SAVINGS_GURU' ? '💰' :
                      badge.code === 'GOAL_GETTER' ? '🏁' :
                        badge.code === 'STREAK_KEEPER' ? '🔥' : '🏅'}
                </div>
                <h4 className={`font-bold ${isEarned ? 'text-gray-800' : 'text-gray-500'}`}>{badge.name}</h4>
                <p className="text-xs text-gray-400 mt-2">{badge.description}</p>

                {isEarned && (
                  <div className="absolute top-3 right-3 text-green-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
