import {Box, Button, Typography, Divider} from '@mui/material';


const Home = () => {
    return (
        <Box>
            <Box
                sx={{
                    boxShadow: 8,
                    border: '1px dashed grey',
                    backgroundColor: '#f5f5f5',
                    px: 6,
                    py: 5,
                    borderRadius: 2,
                    minWidth: 320,
                    maxWidth: 420,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome! Please Login
                </Typography>

                <Button variant="contained" href="/login/passenger" size="large" sx={{width: 200, textTransform:'none'}}>
                    Passenger Login
                </Button>

                <Divider sx={{width: 200, my: 1}}>
                    OR
                </Divider>

                <Button variant="contained" href="/login/staff" color="secondary" size="large" sx={{width: 200, textTransform:'none'}}>
                    Staff Login
                </Button>
            </Box>
        </Box>
    );
};

export default Home;


