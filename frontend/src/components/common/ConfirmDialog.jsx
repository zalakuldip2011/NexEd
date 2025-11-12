import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-red-600 hover:bg-red-700",
  icon = "warning", // 'warning', 'danger', 'info', 'success'
  loading = false
}) => {
  const { isDarkMode } = useTheme();

  const getIcon = () => {
    switch (icon) {
      case 'warning':
      case 'danger':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        );
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
                isDarkMode
                  ? 'bg-slate-800 border border-slate-700'
                  : 'bg-white'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-slate-700 text-slate-400'
                    : 'hover:bg-gray-100 text-gray-400'
                }`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="p-6">
                {/* Icon */}
                <div className="mb-4">
                  {getIcon()}
                </div>

                {/* Title */}
                <h3 className={`text-xl font-bold text-center mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {title}
                </h3>

                {/* Message */}
                <p className={`text-center mb-6 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  {message}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    disabled={loading}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {cancelText}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    onClick={onConfirm}
                    disabled={loading}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-colors shadow-lg ${confirmButtonClass} ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Processing...
                      </div>
                    ) : (
                      confirmText
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
