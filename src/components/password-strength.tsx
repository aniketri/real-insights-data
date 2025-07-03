'use client';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score++;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score++;
    } else {
      feedback.push('Mix of uppercase & lowercase');
    }

    if (/\d/.test(password)) {
      score++;
    } else {
      feedback.push('At least one number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    } else {
      feedback.push('At least one special character');
    }

    const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
    const color = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][score];
    
    return { score, strength, color, feedback };
  };

  if (!password) return null;

  const { score, strength, color, feedback } = getPasswordStrength(password);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${(score / 4) * 100}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <span
          className="text-sm font-medium"
          style={{ color }}
        >
          {strength}
        </span>
      </div>
      {feedback.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-center space-x-1">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 