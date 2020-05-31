import React, { useState, useCallback } from 'react'
import {
  Input,
  Form,
  FormGroup,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap'
import cookie from 'js-cookie'
import { mutate } from 'swr'
import useToggle from '../hooks/useToggle'

function LoginForm({ setDatabaseItems }) {
  const [loginError, setLoginError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginModalOpen, toggleLoginModal] = useToggle()

  const handleCloseClick = useCallback(() => {
    setEmail()
    setPassword()
    toggleLoginModal()
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    //call api
    fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((r) => {
        return r.json()
      })
      .then((data) => {
        if (data && data.error) {
          setLoginError(data.message)
        }
        // checks if user has logged in and has an object of items
        if (data && data.token && Object.keys(data.listData).length !== 0) {
          setDatabaseItems(data.listData)
          cookie.set('token', data.token, { expires: 2 })
          // resets field data & closes modal
          setEmail()
          setPassword()
          mutate('/api/me')
          // if user only has an empty object of items, close modal
        } else if (data && data.token) {
          cookie.set('token', data.token, { expires: 2 })
          // resets field data & closes modal
          setEmail()
          setPassword()
          toggleLoginModal()
          mutate('/api/me')
        }
      })
  }

  return (
    <>
      <button onClick={toggleLoginModal} color='success' className='m-1 badge badge-pill shadow-sm'>Login</button>
      <Modal
        isOpen={loginModalOpen}
        toggle={handleCloseClick}
        modalTransition={{ timeout: 0 }}
        backdropTransition={{ timeout: 0 }}
      >
        <Form onSubmit={handleSubmit}>
          <ModalHeader tag='h2' close={<i className='close fa fa-close cursor-pointer' onClick={handleCloseClick} />}>
            Login
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for='email'>
                Email
              <Input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Label>
            </FormGroup>
            <FormGroup>
              <Label for='password'>
                Password
            <Input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Label>
            </FormGroup>
            <ModalFooter>
              <Input type="submit" value="Submit" />
            </ModalFooter>
            {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
          </ModalBody>
        </Form>
      </Modal>
    </>
  )
}

export default LoginForm
