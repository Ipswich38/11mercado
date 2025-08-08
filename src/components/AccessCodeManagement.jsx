import React, { useState } from 'react';
import { Button } from './ui/button';
import { Plus, Trash2, Copy } from 'lucide-react';

const AccessCodeManagement = ({ user }) => {
  const [accessCodes, setAccessCodes] = useState([
    {
      id: 1,
      code: 'BETA2024',
      created: '2024-01-15',
      uses: 5,
      maxUses: 10,
      active: true,
    },
    {
      id: 2,
      code: 'DEMO2024',
      created: '2024-01-20',
      uses: 2,
      maxUses: 5,
      active: true,
    },
    {
      id: 3,
      code: 'TEST2024',
      created: '2024-01-25',
      uses: 10,
      maxUses: 10,
      active: false,
    },
  ]);

  const [newCode, setNewCode] = useState({ code: '', maxUses: 10 });
  const [isCreating, setIsCreating] = useState(false);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateCode = async () => {
    setIsCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const code = newCode.code || generateRandomCode();
    const newAccessCode = {
      id: Date.now(),
      code,
      created: new Date().toISOString().split('T')[0],
      uses: 0,
      maxUses: newCode.maxUses,
      active: true,
    };

    setAccessCodes((prev) => [...prev, newAccessCode]);
    setNewCode({ code: '', maxUses: 10 });
    setIsCreating(false);
  };

  const handleDeleteCode = (id) => {
    if (confirm('Are you sure you want to delete this access code?')) {
      setAccessCodes((prev) => prev.filter((code) => code.id !== id));
    }
  };

  const handleToggleActive = (id) => {
    setAccessCodes((prev) =>
      prev.map((code) =>
        code.id === id ? { ...code, active: !code.active } : code,
      ),
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Access code copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Access Code Management
        </h2>

        {/* Create New Code */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Access Code
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Code (leave blank for random)
              </label>
              <input
                type="text"
                value={newCode.code}
                onChange={(e) =>
                  setNewCode((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                placeholder="Enter custom code or leave blank"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Uses
              </label>
              <input
                type="number"
                value={newCode.maxUses}
                onChange={(e) =>
                  setNewCode((prev) => ({
                    ...prev,
                    maxUses: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleCreateCode}
                disabled={isCreating}
                className="w-full"
              >
                <Plus size={16} className="mr-2" />
                {isCreating ? 'Creating...' : 'Create Code'}
              </Button>
            </div>
          </div>
        </div>

        {/* Access Codes List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Access Codes
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Usage
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accessCodes.map((code) => (
                  <tr
                    key={code.id}
                    className={!code.active ? 'opacity-50' : ''}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-purple-600">
                          {code.code}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code.code)}
                          className="p-1 h-auto"
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {code.created}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {code.uses} / {code.maxUses}
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${code.uses >= code.maxUses ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{
                            width: `${(code.uses / code.maxUses) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          code.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {code.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(code.id)}
                        >
                          {code.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCode(code.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessCodeManagement;
