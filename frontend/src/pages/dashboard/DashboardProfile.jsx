import React from 'react'
import { useOutletContext } from 'react-router-dom'
import InfoCard from '../../components/common/InfoCard'
import { getProfileImageUrl } from '../../services/api'

function DashboardProfile(props) {
  const context = useOutletContext() || {}
  const activeUser = props.activeUser || context.activeUser
  const avatarUrl = getProfileImageUrl(activeUser?.profileImage) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser?.displayName || activeUser?.name || activeUser?.email || 'User')}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <section className="dashboard-hero" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <img
          src={avatarUrl}
          alt="User Profile Circle Avatar"
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            border: '3px solid var(--accent)',
            boxShadow: 'var(--shadow-md)'
          }}
        />
        <div>
          <span className="status-pill">{activeUser?.role ? activeUser.role.toUpperCase() : 'STUDENT'}</span>
          <h2 style={{ margin: '0.4rem 0 0.2rem' }}>{activeUser?.displayName || activeUser?.name || 'Student User'}</h2>
          <p style={{ margin: 0 }}>{activeUser?.email || 'N/A'}</p>
        </div>
      </section>

      <section className="content-grid">
        <InfoCard
          title="Profile Snapshot"
          items={[
            `Name: ${activeUser?.displayName || activeUser?.name || 'Student User'}`,
            `Email: ${activeUser?.email || 'N/A'}`,
            `Role: ${activeUser?.role ? activeUser.role.toUpperCase() : 'STUDENT'}`,
            `College: ${activeUser?.college || 'Technology Institute'}`,
            `Branch: ${activeUser?.branch || 'Computer Science'}`
          ]}
        />
        <InfoCard
          title="Skill & Career Radar"
          items={[
            `Skills: ${activeUser?.skills || 'React, JavaScript, Node.js, Express'}`,
            'Graduation Year: 2026',
            'Preferred Roles: Software Developer, Product Engineer',
            'JWT Status: Authenticated & Session Active'
          ]}
        />
      </section>
    </div>
  )
}

export default DashboardProfile
