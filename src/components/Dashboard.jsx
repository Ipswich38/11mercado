import React from 'react';
import { Button } from './ui/button';

const Dashboard = ({
  projects,
  donationDrives,
  weather,
  bulletinItems,
  officers,
  researchTools,
  messages,
  navigateToTab,
  getContrastClass,
}) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className={getContrastClass(
            'bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6',
            'bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl p-6',
          )}
        >
          <h3
            className={getContrastClass(
              'text-lg font-semibold mb-2 text-gray-900',
              'text-lg font-semibold mb-2 text-white',
            )}
          >
            Projects
          </h3>
          <p
            className={getContrastClass(
              'text-3xl font-bold text-purple-600',
              'text-3xl font-bold text-purple-400',
            )}
          >
            {projects.length}
          </p>
          <p
            className={getContrastClass(
              'text-sm text-gray-600',
              'text-sm text-gray-300',
            )}
          >
            Active projects
          </p>
        </div>

        <div
          className={getContrastClass(
            'bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6',
            'bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl p-6',
          )}
        >
          <h3
            className={getContrastClass(
              'text-lg font-semibold mb-2 text-gray-900',
              'text-lg font-semibold mb-2 text-white',
            )}
          >
            Officers
          </h3>
          <p
            className={getContrastClass(
              'text-3xl font-bold text-indigo-600',
              'text-3xl font-bold text-indigo-400',
            )}
          >
            {officers.length}
          </p>
          <p
            className={getContrastClass(
              'text-sm text-gray-600',
              'text-sm text-gray-300',
            )}
          >
            Team members
          </p>
        </div>

        <div
          className={getContrastClass(
            'bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6',
            'bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl p-6',
          )}
        >
          <h3
            className={getContrastClass(
              'text-lg font-semibold mb-2 text-gray-900',
              'text-lg font-semibold mb-2 text-white',
            )}
          >
            Research Tools
          </h3>
          <p
            className={getContrastClass(
              'text-3xl font-bold text-green-600',
              'text-3xl font-bold text-green-400',
            )}
          >
            {researchTools.length}
          </p>
          <p
            className={getContrastClass(
              'text-sm text-gray-600',
              'text-sm text-gray-300',
            )}
          >
            Available tools
          </p>
        </div>

        <div
          className={getContrastClass(
            'bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6',
            'bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl p-6',
          )}
        >
          <h3
            className={getContrastClass(
              'text-lg font-semibold mb-2 text-gray-900',
              'text-lg font-semibold mb-2 text-white',
            )}
          >
            Messages
          </h3>
          <p
            className={getContrastClass(
              'text-3xl font-bold text-orange-600',
              'text-3xl font-bold text-orange-400',
            )}
          >
            {messages.length}
          </p>
          <p
            className={getContrastClass(
              'text-sm text-gray-600',
              'text-sm text-gray-300',
            )}
          >
            Unread messages
          </p>
        </div>
      </div>

      {bulletinItems.length > 0 && (
        <div
          className={getContrastClass(
            'bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6',
            'bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl p-6',
          )}
        >
          <h3
            className={getContrastClass(
              'text-xl font-semibold mb-4 text-gray-900',
              'text-xl font-semibold mb-4 text-white',
            )}
          >
            Bulletin Board
          </h3>
          <div className="space-y-3">
            {bulletinItems.map((item, index) => (
              <div
                key={index}
                className={getContrastClass(
                  'p-4 bg-gray-50 rounded-lg',
                  'p-4 bg-gray-700 rounded-lg',
                )}
              >
                <h4
                  className={getContrastClass(
                    'font-medium text-gray-900',
                    'font-medium text-white',
                  )}
                >
                  {item.title}
                </h4>
                <p
                  className={getContrastClass(
                    'text-sm text-gray-600 mt-1',
                    'text-sm text-gray-300 mt-1',
                  )}
                >
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {weather && (
        <div
          className={getContrastClass(
            'bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6',
            'bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl p-6',
          )}
        >
          <h3
            className={getContrastClass(
              'text-xl font-semibold mb-4 text-gray-900',
              'text-xl font-semibold mb-4 text-white',
            )}
          >
            Weather Information
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p
                className={getContrastClass(
                  'text-2xl font-bold text-gray-900',
                  'text-2xl font-bold text-white',
                )}
              >
                {weather.temperature}°F
              </p>
              <p className={getContrastClass('text-gray-600', 'text-gray-300')}>
                {weather.condition}
              </p>
            </div>
            <div
              className={getContrastClass(
                'text-4xl text-gray-600',
                'text-4xl text-gray-300',
              )}
            >
              {weather.icon}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
