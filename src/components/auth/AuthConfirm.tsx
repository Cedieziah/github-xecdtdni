import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';

const AuthConfirm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmUser = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!token_hash || !type) {
        setStatus('error');
        setMessage('Invalid confirmation link');
        return;
      }

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else {
          setStatus('success');
          setMessage('Email confirmed successfully! You can now sign in.');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    confirmUser();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-black to-primary-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center" glow>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {status === 'loading' && (
            <>
              <Loader size={48} className="text-primary-orange mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-primary-white mb-2">
                Confirming Email
              </h1>
              <p className="text-primary-gray">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle size={48} className="text-robotic-green mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-primary-white mb-2">
                Email Confirmed!
              </h1>
              <p className="text-primary-gray mb-6">
                {message}
              </p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-primary-white mb-2">
                Confirmation Failed
              </h1>
              <p className="text-primary-gray mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/auth')}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </Card>
    </div>
  );
};

export default AuthConfirm;