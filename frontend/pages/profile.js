
import { useState } from 'react';

export default function Profile({ user }) {
	const [email, setEmail] = useState(user?.email || '');
	const [password, setPassword] = useState('');
	const [editing, setEditing] = useState(false);
	const [message, setMessage] = useState('');

	const handleSave = async (e) => {
		e.preventDefault();
		setMessage('');
		// Example API call to update user info
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/update-profile`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (data.success) {
				setMessage('Profile updated successfully!');
				setEditing(false);
			} else {
				setMessage(data.message || 'Update failed.');
			}
		} catch (err) {
			setMessage('Error updating profile.');
		}
	};

	return (
		<div className="profile-page-modern">
			<h1>Profile</h1>
			<div className="profile-card-modern">
				<div className="profile-row-modern">
					<span className="profile-label-modern">Name:</span>
					<span>{user?.name || '-'}</span>
				</div>
				<div className="profile-row-modern">
					<span className="profile-label-modern">Email:</span>
					{editing ? (
						<input
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							className="profile-input-modern"
						/>
					) : (
						<span>{user?.email || '-'}</span>
					)}
				</div>
				<div className="profile-row-modern">
					<span className="profile-label-modern">Password:</span>
					{editing ? (
						<input
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							className="profile-input-modern"
							placeholder="New password"
						/>
					) : (
						<span>********</span>
					)}
				</div>
				<div className="profile-actions-modern">
					{editing ? (
						<>
							<button className="profile-btn-save" onClick={handleSave}>Save</button>
							<button className="profile-btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
						</>
					) : (
						<button className="profile-btn-edit" onClick={() => setEditing(true)}>Edit</button>
					)}
				</div>
				{message && <div className="profile-message-modern">{message}</div>}
			</div>
			<style jsx>{`
				.profile-page-modern {
					max-width: 480px;
					margin: 2rem auto;
					padding: 2rem;
				}
				.profile-card-modern {
					background: #fff;
					border-radius: 16px;
					box-shadow: 0 2px 16px #2563eb11;
					padding: 2rem 2.5rem;
				}
				.profile-row-modern {
					display: flex;
					align-items: center;
					margin-bottom: 1.2rem;
				}
				.profile-label-modern {
					font-weight: 600;
					width: 110px;
					color: #2563eb;
				}
				.profile-input-modern {
					padding: 0.5rem 1rem;
					border-radius: 8px;
					border: 1px solid #ccc;
					font-size: 1rem;
					margin-left: 0.5rem;
				}
				.profile-actions-modern {
					margin-top: 1.5rem;
				}
				.profile-btn-edit, .profile-btn-save, .profile-btn-cancel {
					padding: 0.6rem 1.4rem;
					border-radius: 8px;
					border: none;
					font-weight: 600;
					font-size: 1rem;
					cursor: pointer;
					margin-right: 0.7rem;
					box-shadow: 0 2px 8px #2563eb22;
					transition: background 0.15s;
				}
				.profile-btn-edit {
					background: linear-gradient(90deg, #6366f1 0%, #2563eb 100%);
					color: #fff;
				}
				.profile-btn-save {
					background: #2563eb;
					color: #fff;
				}
				.profile-btn-cancel {
					background: #eee;
					color: #222;
				}
				.profile-message-modern {
					margin-top: 1rem;
					color: #2563eb;
					font-weight: 500;
				}
			`}</style>
		</div>
	);
}
