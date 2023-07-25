package backEnd.Project.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import backEnd.Project.Model.User;
import backEnd.Project.Repo.ProjectRepo;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    ProjectRepo projectRepo;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user;
        try {
            user = projectRepo.findByEmail(email);
        } catch (Exception e) {
            throw new UsernameNotFoundException("User Not Found with email: " + email, e);
        }

        if (user == null) {
            throw new UsernameNotFoundException("User Not Found with email: " + email);
        }

        return UserDetailsImpl.build(user);
    }
}
