let path = require('path')
let renderTemplate = require(path.join(__dirname, '/../test-helpers/html-assertions.js')).render

describe('The team members view', function () {
  it('should render all team members with links grouped by role', function () {
    let templateData = {
      'number_active_members': 6,
      'number_admin_members': 2,
      'number_view-and-refund_members': 1,
      'number_view-only_members': 3,
      'team_members': {
        'admin': [
          { username: 'username1', link: 'view-username1-link' },
          { username: 'username2', link: 'view-username2-my-profile-link', is_current: true }
        ],
        'view-only': [
          { username: 'username3', link: 'view-username3-link' },
          { username: 'username4', link: 'view-username4-link' },
          { username: 'username5', link: 'view-username5-link' }
        ],
        'view-and-refund': [
          { username: 'username6', link: 'view-username6-link' }
        ]
      },
      permissions: {
        'users_service_read': true
      }
    }

    let body = renderTemplate('team-members/team-members', templateData)

    body.should.containSelector('#admin-role-header').withExactText('Administrators (2)')
    body.should.containSelector('#view-only-role-header').withExactText('View only (3)')
    body.should.containSelector('#view-and-refund-role-header').withExactText('View and refund (1)')

    body.should.containSelector('#team-members-admin-list .govuk-table').havingNumberOfRows(2)
    body.should.containSelector('#team-members-admin-list .govuk-table').havingRowAt(1).withText('username1')
    body.should.containSelector('#team-members-admin-list .govuk-table').havingRowAt(1).withALinkTo('view-username1-link')
    body.should.containSelector('#team-members-admin-list .govuk-table').havingRowAt(2).withText('username2 (you)')
    body.should.containSelector('#team-members-admin-list .govuk-table').havingRowAt(2).withALinkTo('view-username2-my-profile-link')

    body.should.containSelector('#team-members-view-only-list .govuk-table').havingNumberOfRows(3)
    body.should.containSelector('#team-members-view-only-list .govuk-table').havingRowAt(1).withText('username3')
    body.should.containSelector('#team-members-view-only-list .govuk-table').havingRowAt(1).withALinkTo('view-username3-link')
    body.should.containSelector('#team-members-view-only-list .govuk-table').havingRowAt(2).withText('username4')
    body.should.containSelector('#team-members-view-only-list .govuk-table').havingRowAt(2).withALinkTo('view-username4-link')
    body.should.containSelector('#team-members-view-only-list .govuk-table').havingRowAt(3).withText('username5')
    body.should.containSelector('#team-members-view-only-list .govuk-table').havingRowAt(3).withALinkTo('view-username5-link')

    body.should.containSelector('#team-members-view-and-refund-list .govuk-table').havingNumberOfRows(1)
    body.should.containSelector('#team-members-view-and-refund-list .govuk-table').havingRowAt(1).withText('username6')
    body.should.containSelector('#team-members-view-and-refund-list .govuk-table').havingRowAt(1).withALinkTo('view-username6-link')
  })
  it('should render all team members without links if user does not have read permissions', function () {
    let templateData = {
      'number_active_members': 2,
      'number_admin_members': 1,
      'number_view-and-refund_members': 0,
      'number_view-only_members': 1,
      'team_members': {
        'admin': [
          { username: 'username2', link: 'view-username2-my-profile-link', is_current: true }
        ],
        'view-only': [
          { username: 'username5', link: 'view-username5-link' }
        ],
        'view-and-refund': []
      }
    }

    let body = renderTemplate('team-members/team-members', templateData)

    body.should.containSelector('#team-members-view-only-list .govuk-table').havingRowAt(1).withNoLink()
  })

  it('should render invite a team member option when user has create permissions', function () {
    let templateData = {
      permissions: {
        'users_service_read': true,
        'users_service_create': true
      }
    }

    let body = renderTemplate('team-members/team-members', templateData)

    body.should.containSelector('#invite-team-member-link')
  })

  it('should not render invite a team member option when user has no create permissions', function () {
    let templateData = {
      permissions: {
        'users_service_read': true,
        'users_service_create': false
      }
    }

    let body = renderTemplate('team-members/team-members', templateData)

    body.should.not.containSelector('#invite-team-member-link')
  })
  it('should render all invited team members grouped by role', function () {
    let templateData = {
      'number_invited_members': 5,
      'number_admin_invited_members': 2,
      'number_view-only_invited_members': 1,
      'number_view-and-refund_invited_members': 2,
      'invited_team_members': {
        'admin': [
          { username: 'username1' },
          { username: 'username2' }
        ],
        'view-only': [
          { username: 'username3' }
        ],
        'view-and-refund': [
          { username: 'username6' },
          { username: 'username5' }
        ]
      },
      permissions: {
        'users_service_read': true
      }
    }

    let body = renderTemplate('team-members/team-members', templateData)

    body.should.containSelector('#invited-team-members-heading').withExactText('Invited (5)')
    body.should.containSelector('#invited-team-members-admin-role-header').withExactText('Administrators (2)')
    body.should.containSelector('#invited-team-members-view-only-role-header').withExactText('View only (1)')
    body.should.containSelector('#invited-team-members-view-and-refund-role-header').withExactText('View and refund (2)')

    body.should.containSelector('#invited-team-members-admin-list .govuk-table').havingNumberOfRows(2)
    body.should.containSelector('#invited-team-members-admin-list .govuk-table').havingRowAt(1).withText('username1')
    body.should.containSelector('#invited-team-members-admin-list .govuk-table').havingRowAt(2).withText('username2')

    body.should.containSelector('#invited-team-members-view-only-list .govuk-table').havingNumberOfRows(1)
    body.should.containSelector('#invited-team-members-view-only-list .govuk-table').havingRowAt(1).withText('username3')

    body.should.containSelector('#invited-team-members-view-and-refund-list .govuk-table').havingNumberOfRows(2)
    body.should.containSelector('#invited-team-members-view-and-refund-list .govuk-table').havingRowAt(1).withText('username6')
    body.should.containSelector('#invited-team-members-view-and-refund-list .govuk-table').havingRowAt(2).withText('username5')
  })
  it('should not render invited team members list if there are no invitations', function () {
    let templateData = {
      'number_invited_members': 0,
      'number_admin_invited_members': 0,
      'number_view-only_invited_members': 0,
      'number_view-and-refund_invited_members': 0,
      'invited_team_members': {
        'admin': [],
        'view-only': [],
        'view-and-refund': []
      }
    }

    let body = renderTemplate('team-members/team-members', templateData)
    body.should.not.containSelector('#invited-team-members-heading')
    body.should.not.containSelector('#invited-team-members-admin-role-header')
    body.should.not.containSelector('#invited-team-members-view-only-role-header')
    body.should.not.containSelector('#invited-team-members-view-and-refund-role-header')

    body.should.not.containSelector('#invited-team-members-admin-list')
    body.should.not.containSelector('#invited-team-members-view-only-list')
    body.should.not.containSelector('#invited-team-members-view-and-refund-list')
  })
})
