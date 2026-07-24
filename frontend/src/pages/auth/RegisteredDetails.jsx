import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getMe, getProfileImageUrl } from '../../services/api'
import '../../styles/Register.css'

const AUTH_STORAGE_KEY = 'placement-auth-user'

function RegisteredDetails() {
  const location = useLocation()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(() => {
    if (typeof window === 'undefined') {
      return null
    }

    if (location.state?.userData) {
      return location.state.userData
    }

    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null')
    } catch {
      return null
    }
  })

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const response = await getMe()
        if (response && response.user) {
          const user = response.user
          const updatedUser = {
            id: user.id,
            fullName: user.name,
            name: user.name,
            email: user.email,
            role: user.role,
            mobile: user.mobile,
            college: user.college,
            branch: user.branch,
            graduationYear: user.graduationYear,
            skills: user.skills,
            profileImage: user.profileImage,
          }
          setUserData(updatedUser)
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
        }
      } catch {
        // Fallback to cached state
      }
    }

    fetchLatestProfile()
  }, [])

  if (!userData) {
    return (
      <main className="page register-page">
        <section className="register-card">
          <div className="register-card__header">
            <div>
              <p className="eyebrow">No Session Active</p>
              <h2>No account details were found.</h2>
              <p>Please log in or register to view your user profile details.</p>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="button" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page register-page">
      <section className="register-card">
        <div className="register-card__header">
          <div>
            <p className="eyebrow">Account Summary</p>
            <h2>User Profile Details</h2>
            <p>Authenticated session and profile overview from MongoDB.</p>
          </div>
        </div>

        <div className="details-table-wrap">
          <table className="details-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Profile Avatar</td>
                <td>
                  <div className="profile-preview">
                    <img
                      src={getProfileImageUrl(userData.profileImage) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.fullName || userData.email || 'User')}`}
                      alt="Profile Avatar"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td>Full Name</td>
                <td>{userData.fullName || userData.name || 'Not provided'}</td>
              </tr>
              <tr>
                <td>Email Address</td>
                <td>{userData.email || 'Not provided'}</td>
              </tr>
              <tr>
                <td>Account Role</td>
                <td>
                  <span className="status-pill" style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    {userData.role || 'student'}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Phone Number</td>
                <td>{userData.mobile || userData.phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td>College</td>
                <td>{userData.college || 'Not provided'}</td>
              </tr>
              <tr>
                <td>Branch</td>
                <td>{userData.branch || 'Not provided'}</td>
              </tr>
              <tr>
                <td>Graduation Year</td>
                <td>{userData.graduationYear || 'Not provided'}</td>
              </tr>
              <tr>
                <td>Skills</td>
                <td>{userData.skills || 'Not provided'}</td>
              </tr>
              <tr>
                <td>Actions</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => navigate('/dashboard/profile')}
                    >
                      Dashboard Profile
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => navigate('/dashboard')}
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default RegisteredDetails
