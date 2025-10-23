import React from 'react';
import { FiArrowLeft, FiActivity, FiCheckCircle, FiPlus, FiTrash2, FiCalendar, FiDroplet, FiMenu, FiInfo, FiLogOut } from 'react-icons/fi';

const Help = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 animate-fade-in">
      <div className="glass shadow-soft border-b border-white/20">
        <div className="max-w-md mx-auto mobile-padding py-4 sm:py-6 flex items-center">
          <button
            onClick={onBack}
            aria-label="Back"
            title="Back"
            className="mr-4 p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 focus-ring"
          >
            <FiArrowLeft size={20} className="text-gray-700 dark:text-gray-100" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text text-shadow-sm">Help & Tips</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto mobile-padding py-4 sm:py-6 space-y-4">
        <div className="card-base p-5">
          <h2 className="text-lg font-bold mb-2 flex items-center"><FiMenu className="mr-2 text-gray-700" />Menu & Navigation</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Tap the menu button in the header to access Home, Glucose Tracking, Help, Theme, and account options. Help and Sign Out are now in the menu.
          </p>
        </div>

        <div className="card-base p-5">
          <h2 className="text-lg font-bold mb-2 flex items-center"><FiPlus className="mr-2 text-blue-600" />Add Workouts</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Tap the plus button to add a workout. Use templates or create your own exercises. The first exercise you add is number 1.</p>
        </div>

        <div className="card-base p-5">
          <h2 className="text-lg font-bold mb-2 flex items-center"><FiCalendar className="mr-2 text-gray-600" />Filter & Dates</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Use the chips to switch views: All, Today's, or Completed. Use the date picker above the list to filter All/Completed by a specific day.</p>
        </div>

        <div className="card-base p-5">
          <h2 className="text-lg font-bold mb-2 flex items-center"><FiCheckCircle className="mr-2 text-green-600" />Complete Workouts</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Mark a workout complete from the list, or check exercises inside details. Progress updates automatically.</p>
        </div>

        <div className="card-base p-5">
          <h2 className="text-lg font-bold mb-2 flex items-center"><FiDroplet className="mr-2 text-rose-600" />Blood Sugar</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Track meter and CGM readings from the Glucose Tracking section in the menu. Averages and differences appear in the snapshot. You can still add before/after values per workout.
          </p>
        </div>

        <div className="card-base p-5">
          <h2 className="text-lg font-bold mb-2 flex items-center"><FiInfo className="mr-2 text-gray-700" />App Version & Updates</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            The app shows its current version at the bottom of the menu. Tap <strong>Check</strong> or <strong>Check for Updates</strong> to see if a newer version is available.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            If a new version is found, the app reloads to apply it. The version is updated automatically on each push to the main (and dev) branch.
          </p>
        </div>

        <div className="card-base p-5">
          <h2 className="text-lg font-bold mb-2 flex items-center"><FiLogOut className="mr-2 text-gray-700" />Sign Out</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Open the menu and tap Sign Out at the bottom to securely log out of your account.</p>
        </div>

        <div className="card-base p-5">
          <h2 className="text-lg font-bold mb-2 flex items-center"><FiTrash2 className="mr-2 text-red-600" />Delete & Templates</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Deleting removes a workout permanently. When you add a workout it is also saved as a personal template for quick reuse.</p>
        </div>

        <div className="text-center">
          <button onClick={onBack} className="btn-primary px-6 py-3 text-sm">Back to App</button>
        </div>
      </div>
    </div>
  );
};

export default Help;
